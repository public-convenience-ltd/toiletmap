/* eslint-disable  @typescript-eslint/no-explicit-any */

import GET, { fetchAllToilets } from '../pages/api/cron/daily_export.page';
import { afterAll, expect } from '@jest/globals';

jest.mock('../api/prisma/prisma', () => ({
  __esModule: true,
  default: {
    toilets: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  list: jest.fn(),
  del: jest.fn(),
}));

import prisma from '../api/prisma/prisma';
import { put, list, del } from '@vercel/blob';
import { jest } from '@jest/globals';

type ExportToilet = {
  id: string;
  active: boolean;
  name?: string | null;
  location?: any;
  areas?: { id: string; name: string };
  created_at?: Date;
  updated_at?: Date;
};

const asAny = (v: unknown) => v as any;

describe('export script', () => {
  const originalEnv = process.env;
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv, CRON_SECRET: 'sekrit' };
  });

  afterAll(() => {
    process.env = originalEnv;
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function makeToilet(
    id: string,
    overrides: Partial<ExportToilet> = {},
  ): ExportToilet {
    return {
      id,
      active: true,
      name: `Toilet ${id}`,
      location: { type: 'Point', coordinates: [-2.98007369, 53.408572537] },
      areas: { id: '5ef9eb2c52244558fd02f298', name: 'Liverpool' },
      created_at: new Date('2016-09-14T08:29:33.237Z'),
      updated_at: new Date('2016-09-14T08:29:33.237Z'),
      ...overrides,
    };
  }

  test('fetchAllToilets paginates with cursor and reports progress', async () => {
    const batch1 = [makeToilet('0001'), makeToilet('0002')];
    const batch2 = [makeToilet('0003')];
    const batch3: ExportToilet[] = [];

    asAny(prisma.toilets.findMany)
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2)
      .mockResolvedValueOnce(batch3);

    const progressCalls: Array<{ count: number; ids: string[] }> = [];
    const results: ExportToilet[] = [];

    const gen = fetchAllToilets({
      batchSize: 2,
      onProgress: (count, batch) => {
        progressCalls.push({ count, ids: batch.map((b) => b.id) });
      },
    });

    for await (const t of gen) results.push(t);

    // yielded items in order
    expect(results.map((r) => r.id)).toEqual(['0001', '0002', '0003']);

    // progress called per non-empty batch with cumulative counts
    expect(progressCalls).toEqual([
      { count: 2, ids: ['0001', '0002'] },
      { count: 3, ids: ['0003'] },
    ]);

    // prisma called with expected pagination parameters
    expect(prisma.toilets.findMany).toHaveBeenCalledTimes(3);
    const firstCallArgs = asAny(prisma.toilets.findMany).mock.calls[0][0];
    expect(firstCallArgs.where).toEqual({ active: true });
    expect(firstCallArgs.take).toBe(2);
    expect(firstCallArgs.orderBy).toEqual({ id: 'asc' });
  });

  test('GET returns 401 when auth is missing or incorrect', async () => {
    const req = {
      headers: { authorization: 'Bearer nope' },
    } as any;

    const res = await GET(req);
    expect(res.status).toBe(401);
    const text = await (res as Response).text();
    expect(text).toBe('Unauthorized');
  });

  test('GET cleans old exports, uploads JSON and CSV, and responds with blob URLs', async () => {
    // prisma batches: 2 items then empty to stop
    const t1 = makeToilet('000071659b92538075e11c01', {
      // location as string to exercise JSON.parse branch
      location: '{"type":"Point","coordinates":[0.572013,51.6672193]}',
      name: 'Chelmsford',
      areas: { id: '5ef9eb2c52244558fd02f1f5', name: 'Chelmsford' },
      created_at: new Date('2016-09-14T09:31:35.199Z'),
    });
    const t2 = makeToilet('0008810c8a58ea5f7d41c04a', {
      name: "St George's hall",
      location: { type: 'Point', coordinates: [-2.98007369, 53.408572537] },
      areas: { id: '5ef9eb2c52244558fd02f298', name: 'Liverpool' },
      created_at: new Date('2016-09-14T08:29:33.237Z'),
    });

    asAny(prisma.toilets.findMany)
      .mockResolvedValueOnce([t1, t2])
      .mockResolvedValueOnce([]);

    asAny(list).mockResolvedValue({
      blobs: [
        { url: 'https://blob/exports/old.json', pathname: 'exports/old.json' },
        { url: 'https://blob/exports/old.csv', pathname: 'exports/old.csv' },
      ],
    });

    asAny(del).mockResolvedValue(undefined);

    // two uploads: json + csv
    asAny(put)
      .mockResolvedValueOnce({ url: 'https://blob/exports/new.json' })
      .mockResolvedValueOnce({ url: 'https://blob/exports/new.csv' });

    const req = {
      headers: { authorization: 'Bearer sekrit' },
    } as any;

    const res = (await GET(req)) as Response;
    expect(res.ok).toBe(true);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.jsonBlobUrl).toBe('https://blob/exports/new.json');
    expect(body.csvBlobUrl).toBe('https://blob/exports/new.csv');

    // Clean-up ran
    expect(list).toHaveBeenCalledWith({ prefix: 'exports/' });
    expect(del).toHaveBeenCalledTimes(2);
    expect(asAny(del).mock.calls.map((c: any[]) => c[0])).toEqual([
      'https://blob/exports/old.json',
      'https://blob/exports/old.csv',
    ]);

    // Uploads happened with expected args
    expect(put).toHaveBeenCalledTimes(2);

    // Check JSON upload payload is JSON of fetched toilets
    const jsonPutArgs = asAny(put).mock.calls[0];
    expect(jsonPutArgs[0]).toMatch(/^exports\/toilets-\d{4}-\d{2}-\d{2}T/);
    const jsonPayload = jsonPutArgs[1];
    expect(() => JSON.parse(jsonPayload)).not.toThrow();
    expect(jsonPutArgs[2]).toMatchObject({
      access: 'public',
      contentType: 'application/json',
      multipart: true,
    });

    // Check CSV upload payload includes longitude/latitude columns and escaping
    const csvPutArgs = asAny(put).mock.calls[1];
    expect(csvPutArgs[0]).toMatch(/^exports\/toilets-\d{4}-\d{2}-\d{2}T/);
    const csvPayload: string = csvPutArgs[1];

    // Header contains longitude and latitude at the end
    const [header, row1, row2] = csvPayload.split('\n');
    expect(header.endsWith('longitude,latitude')).toBe(true);

    // Row has quoted fields and coords copied out correctly
    // t1 coords [0.572013, 51.6672193]
    expect(row1).toContain('"0.572013"');
    expect(row1).toContain('"51.6672193"');

    // t2 coords [-2.98007369, 53.408572537] — quoted
    expect(row2).toContain('"-2.98007369"');
    expect(row2).toContain('"53.408572537"');

    // Check basic CSV escaping for apostrophe in "St George's hall"
    expect(row2).toContain('"St George\'s hall"');

    // ContentType for CSV correct
    expect(csvPutArgs[2]).toMatchObject({
      access: 'public',
      contentType: 'text/csv',
      multipart: true,
    });

    // Progress logs called at least once
    expect(
      logSpy.mock.calls.some((c) =>
        /Fetched \d+ toilets so far/.test(String(c[0])),
      ),
    ).toBe(true);

    // Success logs for uploads
    expect(
      logSpy.mock.calls.some((c) =>
        /Successfully uploaded JSON export/.test(String(c[0])),
      ),
    ).toBe(true);
    expect(
      logSpy.mock.calls.some((c) =>
        /Successfully uploaded CSV export/.test(String(c[0])),
      ),
    ).toBe(true);
  });

  test('GET returns 500 if blob upload throws', async () => {
    // one small batch then stop
    const t = makeToilet('boom');
    asAny(prisma.toilets.findMany)
      .mockResolvedValueOnce([t])
      .mockResolvedValueOnce([]);

    asAny(list).mockResolvedValue({ blobs: [] });
    asAny(put).mockRejectedValue(new Error('network sad times'));

    const req = {
      headers: { authorization: 'Bearer sekrit' },
    } as any;

    const res = (await GET(req)) as Response;
    expect(res.status).toBe(500);
    expect(await res.text()).toBe('Failed to upload blob');
    expect(
      errorSpy.mock.calls.some((c) =>
        /Error uploading blob/.test(String(c[0])),
      ),
    ).toBe(true);
  });
});

import { NextRequest } from 'next/server';
import prisma from '../../../api/prisma/prisma';
import type { toilets as Toilet } from '@prisma/client';
import { put, list, del } from '@vercel/blob';

type ExportToilet = Omit<Toilet, 'contributors' | 'removal_reason'>;

/**
 * An async generator that yields batches of toilet records.
 * This version uses a cursor-based approach to paginate through results.
 */
export async function* fetchAllToilets(
  options: {
    batchSize?: number;
    batchLimit?: number;
    filter?: { active?: boolean };
    orderBy?: { field: keyof ExportToilet; direction: 'asc' | 'desc' };
    onProgress?: (fetchedCount: number, batch: readonly ExportToilet[]) => void;
  } = {},
): AsyncGenerator<readonly ExportToilet[], void, unknown> {
  const {
    batchSize = 100,
    batchLimit = Infinity, // Fetch all batches by default
    filter = { active: true },
    orderBy = { field: 'created_at', direction: 'asc' },
    onProgress,
  } = options;

  let cursor: string | null = null;
  let fetchedCount = 0;

  for (let batchNumber = 0; batchNumber < batchLimit; batchNumber++) {
    // Fetch the next batch of records using a cursor-based pagination
    const toiletsBatch = await prisma.toilets.findMany({
      where: filter,
      include: { areas: { select: { name: true, id: true } } },
      omit: { removal_reason: true, contributors: true },
      orderBy: { [orderBy.field]: orderBy.direction },
      take: batchSize,
      skip: cursor ? 1 : 0,
      ...(cursor && { cursor: { id: cursor } }),
    });

    if (toiletsBatch.length === 0) break;

    fetchedCount += toiletsBatch.length;
    cursor = toiletsBatch[toiletsBatch.length - 1].id;

    // Report progress if a callback is provided
    onProgress?.(fetchedCount, toiletsBatch);

    // Yield the current batch
    yield toiletsBatch;

    // If the batch is not full, assume we've reached the end
    if (toiletsBatch.length < batchSize) break;
  }
}

/**
 * Deletes old exported files from the "exports" folder.
 */
async function cleanExportDirectory() {
  try {
    const allFiles = (await list({ prefix: 'exports/' })).blobs;

    if (allFiles.length === 0) {
      console.log('No old files to delete');
      return;
    }

    for (const file of allFiles) {
      await del(file.url);
      console.log(`Deleted old file: ${file.pathname}`);
    }
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
}

/**
 * GET endpoint that:
 * 1. Fetches all active toilet records using the async generator.
 * 2. Converts the records to JSON.
 * 3. Deletes old exported files.
 * 4. Uploads the JSON file as a blob.
 */
export default async function GET(request: NextRequest) {
  const authHeader = request.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Use Array.fromAsync to collect all batches from the async generator
  const batches = await Array.fromAsync(
    fetchAllToilets({
      batchSize: 4000,
      filter: { active: true },
      orderBy: { direction: 'asc', field: 'created_at' },
      onProgress: (count) => console.log(`Fetched ${count} toilets so far`),
    }),
  );

  // Flatten the array of batches into a single array of toilets
  const toilets = batches.flat();

  const toiletsJson = JSON.stringify(toilets);

  try {
    // Clean the export directory before uploading the new file.
    await cleanExportDirectory();

    const fileName = `toilets-${Date.now()}.json`;
    const uploadPath = `exports/${fileName}`;
    const blob = await put(uploadPath, toiletsJson, {
      access: 'public',
      multipart: true,
      onUploadProgress: (progress) => {
        console.log(
          `Uploading toilets export progress: ${progress.percentage}%`,
        );
      },
      contentType: 'application/json',
    });

    console.log(`Successfully uploaded toilets export to blob at ${blob.url}`);

    return Response.json({ success: true, blobUrl: blob.url });
  } catch (uploadError) {
    console.error('Error uploading blob:', uploadError);
    return new Response('Failed to upload blob', { status: 500 });
  }
}

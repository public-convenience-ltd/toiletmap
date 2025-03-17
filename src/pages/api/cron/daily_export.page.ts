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
    onProgress?: (fetchedCount: number, batch: readonly ExportToilet[]) => void;
  } = {},
): AsyncGenerator<ExportToilet, void, unknown> {
  const { batchSize = 100, onProgress } = options;

  let cursor: string | undefined;
  let fetchedCount = 0;

  while (true) {
    // Fetch the next batch of records using a cursor-based pagination
    const toiletsBatch = await prisma.toilets.findMany({
      // Only include active toilets in the response.
      where: { active: true },
      // Include the "areas" relation in the response so we can access the area name.
      include: {
        areas: { select: { name: true, id: true } },
      },
      // Omit the removal_reason and contributors fields from the response
      omit: { removal_reason: true, contributors: true },
      // Sort by the cursor as recommended in the docs:
      // https://www.prisma.io/docs/orm/prisma-client/queries/pagination#-pros-of-cursor-based-pagination
      orderBy: {
        id: 'asc',
      },
      // Limit the number of records returned to the value of batchSize.
      take: batchSize,
      // If a cursor is provided, we skip the record at the cursor position.
      // This prevents returning the record that was already used as the starting point.
      skip: cursor ? 1 : 0,
      // If a cursor value is provided, start the query from the record with that id.
      ...(cursor && { cursor: { id: cursor } }),
    });

    fetchedCount += toiletsBatch.length;
    cursor = toiletsBatch.at(-1)?.id;

    // If no cursor was found we've reached the end
    if (!cursor) return;

    // Report progress if a callback is provided
    onProgress?.(fetchedCount, toiletsBatch);

    // Yield the current items from the batch
    yield* toiletsBatch;
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
 * Converts an array of ExportToilet objects into CSV format.
 *
 * @param {ExportToilet[]} data - Array of ExportToilet objects.
 * @returns {string} CSV formatted string.
 */
function convertToCSV(data: ExportToilet[]): string {
  // Replacer function for JSON.stringify that converts null values to empty strings
  const replacer = (_key: string, value: unknown) =>
    value === null ? '' : value;

  // Extract headers from the keys of the first object
  const headers = Object.keys(data[0]);

  // Map each data row into a CSV formatted string
  const csvRows = data.map((row) => {
    const formattedRow = headers.map((header) => {
      let cellValue = row[header];

      // If the cell value is an object, convert it to a JSON string
      if (typeof cellValue === 'object') {
        cellValue = JSON.stringify(cellValue, replacer);
      }

      // Escape double quotes by doubling them and wrap the value in quotes
      const escapedValue = String(cellValue).replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    return formattedRow.join(',');
  });

  // Prepend the header row and join all rows with newlines
  return [headers.join(','), ...csvRows].join('\n');
}

/**
 * GET endpoint that:
 * 1. Fetches all active toilet records using the async generator.
 * 2. Converts the records to JSON and CSV.
 * 3. Deletes old exported files.
 * 4. Uploads the JSON and CSV files as blobs.
 */
export default async function GET(request: NextRequest) {
  const authHeader = request.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Collect all toilet records using the async generator.
  const toilets = await Array.fromAsync(
    fetchAllToilets({
      batchSize: 4000,
      onProgress: (count) => console.log(`Fetched ${count} toilets so far`),
    }),
  );

  const toiletsJson = JSON.stringify(toilets);
  const toiletsCsv = convertToCSV(toilets);

  try {
    // Clean the export directory before uploading new files.
    await cleanExportDirectory();

    const timestamp = new Date().toISOString();
    const jsonFileName = `toilets-${timestamp}.json`;
    const csvFileName = `toilets-${timestamp}.csv`;
    const jsonUploadPath = `exports/${jsonFileName}`;
    const csvUploadPath = `exports/${csvFileName}`;

    // Upload both JSON and CSV concurrently.
    const jsonUploadPromise = put(jsonUploadPath, toiletsJson, {
      access: 'public',
      multipart: true,
      onUploadProgress: (progress) => {
        console.log(`Uploading JSON export progress: ${progress.percentage}%`);
      },
      contentType: 'application/json',
    });

    const csvUploadPromise = put(csvUploadPath, toiletsCsv, {
      access: 'public',
      multipart: true,
      onUploadProgress: (progress) => {
        console.log(`Uploading CSV export progress: ${progress.percentage}%`);
      },
      contentType: 'text/csv',
    });

    const [jsonBlob, csvBlob] = await Promise.all([
      jsonUploadPromise,
      csvUploadPromise,
    ]);

    console.log(`Successfully uploaded JSON export to blob at ${jsonBlob.url}`);
    console.log(`Successfully uploaded CSV export to blob at ${csvBlob.url}`);

    return Response.json({
      success: true,
      jsonBlobUrl: jsonBlob.url,
      csvBlobUrl: csvBlob.url,
    });
  } catch (uploadError) {
    console.error('Error uploading blob:', uploadError);
    return new Response('Failed to upload blob', { status: 500 });
  }
}

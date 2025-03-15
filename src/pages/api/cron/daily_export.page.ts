import { NextRequest } from 'next/server';
import prisma from '../../../api/prisma/prisma';
import type { toilets as Toilet } from '@prisma/client';
import { put, list, del } from '@vercel/blob';

type ExportToilet = Omit<Toilet, 'contributors' | 'removal_reason'>;

async function fetchAllToilets(
  options: {
    batchSize?: number;
    batchLimit?: number;
    filter?: { active?: boolean };
    orderBy?: { field: keyof ExportToilet; direction: 'asc' | 'desc' };
    onProgress?: (fetchedCount: number, batch: readonly ExportToilet[]) => void;
  } = {},
): Promise<readonly ExportToilet[]> {
  const {
    batchSize = 100,
    batchLimit = Infinity, // By default, fetch all batches
    filter = { active: true },
    orderBy = { field: 'created_at', direction: 'asc' },
    onProgress,
  } = options;

  try {
    const results: ExportToilet[] = [];
    let cursor: string | null = null;
    let fetchedCount = 0;
    let hasNextBatch = true;

    for (
      let batchNumber = 0;
      hasNextBatch && batchNumber < batchLimit;
      batchNumber++
    ) {
      // Fetch the next batch of records
      const toiletsBatch = await prisma.toilets.findMany({
        where: filter,
        include: {
          areas: { select: { name: true, id: true } },
        },
        omit: {
          removal_reason: true,
          contributors: true,
        },
        orderBy: { [orderBy.field]: orderBy.direction },
        take: batchSize,
        skip: cursor ? 1 : 0,
        ...(cursor && { cursor: { id: cursor } }),
      });

      // Exit when no more records
      if (toiletsBatch.length === 0) {
        break;
      }

      // Add to results (push is more efficient than concat or spread for large arrays)
      results.push(...toiletsBatch);

      // Update tracking variables
      fetchedCount += toiletsBatch.length;
      cursor = toiletsBatch[toiletsBatch.length - 1].id;

      // Provide batch number along with count for better progress tracking
      onProgress?.(fetchedCount, toiletsBatch);

      // Check if we've reached the end
      hasNextBatch = toiletsBatch.length === batchSize;
    }

    return results;
  } catch (error) {
    console.error('Error fetching toilet records:', error);
    throw new Error(
      `Failed to fetch toilets: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Deletes old exported files from the "exports" folder.
 * It lists all files under "exports/", filters out the current export file,
 * and then deletes the older ones.
 */
async function deleteOldFiles(currentFileName: string) {
  try {
    // List all files in the exports directory.
    const allFiles = (await list({ prefix: 'exports/' })).blobs;

    // Filter files that follow the export naming pattern and are not the current file.
    const filesToDelete = allFiles.filter(({ pathname }) => {
      return (
        pathname !== `exports/${currentFileName}` &&
        pathname.startsWith('exports/toilets-') &&
        pathname.endsWith('.json')
      );
    });

    console.log(filesToDelete, 'filesToDelete');

    // Delete each old file.
    for (const file of filesToDelete) {
      await del(file.url);
      console.log(`Deleted old file: ${file.pathname}`);
    }
  } catch (error) {
    console.error('Error deleting old files:', error);
  }
}

export default async function GET(request: NextRequest) {
  const authHeader = request.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  const toilets = await fetchAllToilets({
    batchSize: 4000,
    filter: { active: true },
    orderBy: { direction: 'asc', field: 'created_at' },
    onProgress: (count) => console.log(`Fetched ${count} toilets so far`),
  });

  // Convert the fetched data to a JSON string
  const toiletsJson = JSON.stringify(toilets);

  try {
    const fileName = `toilets-${+new Date()}.json`;
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

    // Delete old backup files, keeping only the latest one that was just uploaded.
    await deleteOldFiles(fileName);

    return Response.json({ success: true, blobUrl: blob.url });
  } catch (uploadError) {
    console.error('Error uploading blob:', uploadError);
    return new Response('Failed to upload blob', {
      status: 500,
    });
  }
}

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../api/prisma/prisma';
import type { toilets as Toilet } from '@prisma/client';

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
      let batchNumber = 1;
      hasNextBatch && batchNumber <= batchLimit;
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

    // Return as readonly to prevent accidental mutations by consumers
    return Object.freeze(results) as readonly Toilet[];
  } catch (error) {
    console.error('Error fetching toilet records:', error);
    throw new Error(
      `Failed to fetch toilets: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  // Moved connection management responsibility to the caller
}

export default async function GET(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  // const authHeader = request.headers['authorization'];
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', {
  //     status: 401,
  //   });
  // }

  const toilets = await fetchAllToilets({
    batchSize: 500,
    batchLimit: 1,
    filter: { active: true },
    orderBy: { direction: 'asc', field: 'created_at' },
    onProgress: (count) => console.log(`Fetched ${count} toilets so far`),
  });

  return response.json(toilets);
}

/**
 * REST API utility for fetching compressed loo tiles
 * Used in production as primary data source with GraphQL fallback
 */

type CompressedLooArray = [string, string, number];

interface CompressedLooResponse {
  data: CompressedLooArray[];
  count: number;
}

const API_BASE_URL = 'https://toiletmap-server.gbtoiletmap.workers.dev';

/**
 * Fetches compressed loo data from the REST API and normalizes it to match GraphQL format
 *
 * @param geohash - The geohash tile to fetch loos for
 * @param active - Whether to only return active loos (default: true)
 * @returns Array of pipe-delimited loo strings: "id|geohash|filterBitmask"
 * @throws Error on network failure, HTTP errors, or invalid response format
 */
export async function fetchCompressedLoos(
  geohash: string,
  active: boolean = true,
): Promise<string[]> {
  const url = new URL(`${API_BASE_URL}/api/loos/geohash/${geohash}`);
  url.searchParams.set('compressed', 'true');
  if (active) {
    url.searchParams.set('active', 'true');
  }

  let response: Response;

  try {
    response = await fetch(url.toString());
  } catch (error) {
    throw new Error(
      `Network error fetching compressed loos for geohash ${geohash}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `HTTP error fetching compressed loos for geohash ${geohash}: ${response.status} ${response.statusText}`,
    );
  }

  let data: CompressedLooResponse;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(
      `Failed to parse JSON response for geohash ${geohash}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!Array.isArray(data?.data)) {
    throw new Error(
      `Invalid response format for geohash ${geohash}: expected data array, got ${typeof data?.data}`,
    );
  }

  // Transform array format ["id", "geohash", filterBitmask] to pipe-delimited "id|geohash|filterBitmask"
  // This matches the format expected by parseCompressedLoo() in src/lib/loo.ts
  try {
    return data.data.map(([id, hash, filterBitmask]) => {
      if (
        typeof id !== 'string' ||
        typeof hash !== 'string' ||
        typeof filterBitmask !== 'number'
      ) {
        throw new Error('Invalid loo data format in array');
      }
      return `${id}|${hash}|${filterBitmask}`;
    });
  } catch (error) {
    throw new Error(
      `Failed to transform compressed loo data for geohash ${geohash}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

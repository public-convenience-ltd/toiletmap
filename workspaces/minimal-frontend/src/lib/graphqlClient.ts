import ngeohash from 'ngeohash';
import { dedupeLoosById, parseCompressedLoo, TileLoo } from './looCompression';

export interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async request<T>(options: GraphQLRequestOptions): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: JSON.stringify({
        query: options.query,
        variables: options.variables ?? {},
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GraphQLResponse<T>;

    if (payload.errors && payload.errors.length > 0) {
      const [firstError] = payload.errors;
      throw new Error(firstError.message ?? 'Unknown GraphQL error');
    }

    return payload.data;
  }
}

const LOOS_BY_GEOHASH_QUERY = `
  query loosByGeohash($geohash: String!, $active: Boolean = true) {
    loosByGeohash(geohash: $geohash, active: $active)
  }
`;

interface LoosByGeohashResponse {
  loosByGeohash: string[];
}

interface CachedTile {
  geohash: string;
  loos: TileLoo[];
  fetchedAt: number;
}

interface TileCacheOptions {
  ttlMs?: number;
  backgroundDelayMs?: number;
  bucketPrecision?: number;
  ukRequestPrecision?: number;
}

interface GetLoosOptions {
  requireFresh?: boolean;
  backgroundRefresh?: boolean;
}

const DEFAULT_TILE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const DEFAULT_BACKGROUND_DELAY_MS = 75; // Throttle background fetches slightly
const DEFAULT_BUCKET_PRECISION = 5; // Granularity for cached lookup buckets
const UK_REQUEST_PRECISION = 3; // Coarser tiles to minimise all-UK fetches

const UK_BOUNDING_BOX = {
  minLat: 49.85,
  minLng: -8.65,
  maxLat: 60.95,
  maxLng: 2.1,
} as const;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    if (ms <= 0) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });

export class LooTileCache {
  private cache = new Map<string, CachedTile>();
  private inFlight = new Map<string, Promise<CachedTile>>();
  private backgroundQueue: string[] = [];
  private queuedSet = new Set<string>();
  private backgroundDrainRunning = false;
  private ttlMs: number;
  private backgroundDelayMs: number;
  private defaultBucketPrecision: number;
  private ukRequestPrecision: number;

  constructor(private client: GraphQLClient, options: TileCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TILE_TTL_MS;
    this.backgroundDelayMs = options.backgroundDelayMs ?? DEFAULT_BACKGROUND_DELAY_MS;
    this.defaultBucketPrecision = options.bucketPrecision ?? DEFAULT_BUCKET_PRECISION;
    this.ukRequestPrecision = options.ukRequestPrecision ?? UK_REQUEST_PRECISION;
  }

  getCachedLoos(geohash: string): TileLoo[] | undefined {
    return this.cache.get(geohash)?.loos;
  }

  async getLoosForGeohash(
    geohash: string,
    options: GetLoosOptions = {},
  ): Promise<TileLoo[]> {
    const { requireFresh = false, backgroundRefresh = true } = options;
    const cached = this.cache.get(geohash);

    if (cached && !this.isStale(cached)) {
      return cached.loos;
    }

    if (cached && !requireFresh) {
      if (backgroundRefresh) {
        void this.fetchAndCache(geohash).catch((error) => {
          console.warn(`[LooTileCache] Background refresh failed for ${geohash}`, error);
        });
      }
      return cached.loos;
    }

    const tile = await this.fetchAndCache(geohash);
    return tile.loos;
  }

  queueBackgroundFetch(geohashes: string[]): void {
    for (const geohash of geohashes) {
      if (this.queuedSet.has(geohash)) {
        continue;
      }

      const cached = this.cache.get(geohash);
      if (cached && !this.isStale(cached)) {
        continue;
      }

      this.backgroundQueue.push(geohash);
      this.queuedSet.add(geohash);
    }

    if (!this.backgroundDrainRunning && this.backgroundQueue.length > 0) {
      this.backgroundDrainRunning = true;
      void this.drainBackgroundQueue();
    }
  }

  async cacheGeohashes(
    geohashes: string[],
    options: {
      bucketPrecision?: number;
      delayMs?: number;
      requireFresh?: boolean;
    } = {},
  ): Promise<void> {
    const {
      bucketPrecision = this.defaultBucketPrecision,
      delayMs = this.backgroundDelayMs,
      requireFresh = false,
    } = options;

    const uniqueGeohashes = Array.from(new Set(geohashes));

    for (const geohash of uniqueGeohashes) {
      let tile = this.cache.get(geohash);
      if (requireFresh || !tile || this.isStale(tile)) {
        tile = await this.fetchAndCache(geohash);
      }

      if (!tile) {
        continue;
      }

      if (bucketPrecision > 0 && bucketPrecision !== geohash.length) {
        this.ingestLoosIntoBuckets(tile.loos, bucketPrecision, tile.fetchedAt);
      }

      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }

  async primeUkTiles(options: { bucketPrecision?: number } = {}): Promise<void> {
    const geohashes = ngeohash.bboxes(
      UK_BOUNDING_BOX.minLat,
      UK_BOUNDING_BOX.minLng,
      UK_BOUNDING_BOX.maxLat,
      UK_BOUNDING_BOX.maxLng,
      this.ukRequestPrecision,
    );

    if (geohashes.length === 0) {
      return;
    }

    await this.cacheGeohashes(geohashes, {
      bucketPrecision: options.bucketPrecision ?? this.defaultBucketPrecision,
      requireFresh: true,
    });
  }

  async refreshTilesImmediately(geohashes: string[]): Promise<void> {
    await Promise.all(
      geohashes.map((geohash) =>
        this.fetchAndCache(geohash).catch((error) => {
          console.warn(`[LooTileCache] Failed to refresh ${geohash}`, error);
        }),
      ),
    );
  }

  private storeTile(geohash: string, loos: TileLoo[], fetchedAt: number): CachedTile {
    const deduped = dedupeLoosById(loos);
    const tile: CachedTile = {
      geohash,
      loos: deduped,
      fetchedAt,
    };
    this.cache.set(geohash, tile);
    return tile;
  }

  private ingestLoosIntoBuckets(
    loos: TileLoo[],
    targetPrecision: number,
    fetchedAt: number,
  ): void {
    if (targetPrecision <= 0) {
      return;
    }

    const buckets = new Map<string, TileLoo[]>();

    for (const loo of loos) {
      if (!loo.geohash) {
        continue;
      }

      const bucketHash = loo.geohash.slice(0, targetPrecision);

      if (bucketHash.length < targetPrecision) {
        continue;
      }

      const group = buckets.get(bucketHash);
      if (group) {
        group.push(loo);
      } else {
        buckets.set(bucketHash, [loo]);
      }
    }

    for (const [bucketHash, bucketLoos] of buckets.entries()) {
      this.storeTile(bucketHash, bucketLoos, fetchedAt);
    }
  }

  private async drainBackgroundQueue(): Promise<void> {
    while (this.backgroundQueue.length > 0) {
      const geohash = this.backgroundQueue.shift();
      if (!geohash) {
        break;
      }

      this.queuedSet.delete(geohash);

      try {
        await this.getLoosForGeohash(geohash, { requireFresh: true });
      } catch (error) {
        console.warn(`[LooTileCache] Background fetch failed for ${geohash}`, error);
      }

      if (this.backgroundDelayMs > 0) {
        await sleep(this.backgroundDelayMs);
      }
    }

    this.backgroundDrainRunning = false;
  }

  private async fetchAndCache(geohash: string): Promise<CachedTile> {
    const existingPromise = this.inFlight.get(geohash);
    if (existingPromise) {
      return existingPromise;
    }

    const fetchPromise = (async () => {
      const payload = await this.client.request<LoosByGeohashResponse>({
        query: LOOS_BY_GEOHASH_QUERY,
        variables: {
          geohash,
          active: true,
        },
      });

      return this.storeTile(geohash, payload.loosByGeohash.map(parseCompressedLoo), Date.now());
    })();

    this.inFlight.set(geohash, fetchPromise);

    try {
      const tile = await fetchPromise;
      return tile;
    } finally {
      this.inFlight.delete(geohash);
    }
  }

  private isStale(tile: CachedTile): boolean {
    return Date.now() - tile.fetchedAt > this.ttlMs;
  }
}

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT ?? '/api/graphql';

export const graphQLClient = new GraphQLClient(endpoint);

export const looTileCache = new LooTileCache(graphQLClient);

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

interface CachedEntry {
  geohash: string;
  loos: TileLoo[];
  fetchedAt: number;
  sourcePrecision: number;
}

interface SerializedTileCache {
  version: number;
  tiles: CachedEntry[];
}

interface TileCacheOptions {
  ttlMs?: number;
  backgroundDelayMs?: number;
}

interface GetLoosOptions {
  requireFresh?: boolean;
  backgroundRefresh?: boolean;
}

const DEFAULT_TILE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const DEFAULT_BACKGROUND_DELAY_MS = 75; // Throttle background fetches slightly
const CACHE_STORAGE_KEY = 'toiletmap.tileCache.v2';
const CACHE_STORAGE_VERSION = 2;
const PERSIST_DEBOUNCE_MS = 400;
const MAX_PERSISTED_ENTRIES = 120;
const MAX_DERIVED_PRECISION = 6;
const MAX_FETCH_PRECISION = 3;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    if (ms <= 0) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });

export class LooTileCache {
  private cache = new Map<string, CachedEntry>();
  private inFlight = new Map<string, Promise<CachedEntry>>();
  private backgroundQueue: string[] = [];
  private queuedSet = new Set<string>();
  private backgroundDrainRunning = false;
  private ttlMs: number;
  private backgroundDelayMs: number;
  private storage: Storage | null;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private client: GraphQLClient, options: TileCacheOptions = {}) {
    this.ttlMs = options.ttlMs ?? DEFAULT_TILE_TTL_MS;
    this.backgroundDelayMs = options.backgroundDelayMs ?? DEFAULT_BACKGROUND_DELAY_MS;
    this.storage = this.resolveStorage();
    this.restoreFromStorage();
  }

  getCachedLoos(geohash: string): TileLoo[] | undefined {
    return this.cache.get(geohash)?.loos;
  }

  async getLoosForGeohash(
    geohash: string,
    options: GetLoosOptions = {},
  ): Promise<TileLoo[]> {
    const { requireFresh = false, backgroundRefresh = true } = options;
    const fetchKey = this.getFetchKey(geohash);
    const targetEntry = this.cache.get(geohash);
    const fetchEntry = this.cache.get(fetchKey);

    if (targetEntry && !this.isEntryStale(targetEntry)) {
      return targetEntry.loos;
    }

    if (fetchEntry && !this.isEntryStale(fetchEntry)) {
      return this.materializePathFromAncestor(fetchEntry, geohash).loos;
    }

    if (!requireFresh) {
      const ancestor = this.findAncestor(geohash);
      if (ancestor) {
        const derived = this.materializePathFromAncestor(ancestor, geohash);

        if (backgroundRefresh) {
          void this.fetchAndCache(fetchKey).catch((error) => {
            console.warn(`[LooTileCache] Background refresh failed for ${fetchKey}`, error);
          });
        }

        return derived.loos;
      }

      if (targetEntry) {
        if (backgroundRefresh) {
          void this.fetchAndCache(fetchKey).catch((error) => {
            console.warn(`[LooTileCache] Background refresh failed for ${fetchKey}`, error);
          });
        }

        return targetEntry.loos;
      }
    }

    const tile = await this.fetchAndCache(fetchKey);
    return this.materializePathFromAncestor(tile, geohash).loos;
  }

  private getFetchKey(geohash: string): string {
    if (geohash.length === 0) {
      return geohash;
    }

    if (geohash.length <= MAX_FETCH_PRECISION) {
      return geohash;
    }

    return geohash.slice(0, MAX_FETCH_PRECISION);
  }

  queueBackgroundFetch(geohashes: string[]): void {
    for (const geohash of geohashes) {
      const fetchKey = this.getFetchKey(geohash);
      if (this.queuedSet.has(fetchKey)) {
        continue;
      }

      const cached = this.cache.get(fetchKey);
      if (cached && !this.isEntryStale(cached)) {
        continue;
      }

      this.backgroundQueue.push(fetchKey);
      this.queuedSet.add(fetchKey);
    }

    if (!this.backgroundDrainRunning && this.backgroundQueue.length > 0) {
      this.backgroundDrainRunning = true;
      void this.drainBackgroundQueue();
    }
  }

  async refreshTilesImmediately(geohashes: string[]): Promise<void> {
    await Promise.all(
      geohashes.map((geohash) =>
        this.fetchAndCache(this.getFetchKey(geohash)).catch((error) => {
          console.warn(`[LooTileCache] Failed to refresh ${geohash}`, error);
        }),
      ),
    );
  }

  private storeTile(geohash: string, loos: TileLoo[], fetchedAt: number): CachedEntry {
    const deduped = dedupeLoosById(loos);

    this.deleteDerivedEntries(geohash, geohash.length);

    const entry: CachedEntry = {
      geohash,
      loos: deduped,
      fetchedAt,
      sourcePrecision: geohash.length,
    };

    this.cache.set(geohash, entry);
    this.populateDerivedEntries(entry);
    this.schedulePersist();
    return entry;
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

  private async fetchAndCache(geohash: string): Promise<CachedEntry> {
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

  private isEntryStale(entry: CachedEntry): boolean {
    return Date.now() - entry.fetchedAt > this.ttlMs;
  }

  private findAncestor(geohash: string): CachedEntry | undefined {
    let fallback: CachedEntry | undefined;

    for (let length = geohash.length - 1; length >= 1; length -= 1) {
      const prefix = geohash.slice(0, length);
      const candidate = this.cache.get(prefix);
      if (!candidate) {
        continue;
      }

      if (candidate.sourcePrecision === prefix.length) {
        return candidate;
      }

      if (!fallback) {
        fallback = candidate;
      }
    }

    return fallback;
  }

  private materializePathFromAncestor(
    ancestor: CachedEntry,
    targetGeohash: string,
  ): CachedEntry {
    if (!targetGeohash.startsWith(ancestor.geohash)) {
      return ancestor;
    }

    let currentLoops = ancestor.loos;

    for (
      let length = ancestor.geohash.length + 1;
      length <= targetGeohash.length;
      length += 1
    ) {
      const prefix = targetGeohash.slice(0, length);
      const existing = this.cache.get(prefix);

      if (existing && existing.fetchedAt >= ancestor.fetchedAt) {
        currentLoops = existing.loos;
        continue;
      }

      currentLoops = currentLoops.filter((loo) => loo.geohash.startsWith(prefix));
      const deduped = dedupeLoosById(currentLoops);
      const entry: CachedEntry = {
        geohash: prefix,
        loos: deduped,
        fetchedAt: ancestor.fetchedAt,
        sourcePrecision: ancestor.sourcePrecision,
      };

      this.cache.set(prefix, entry);
      currentLoops = entry.loos;
    }

    let target = this.cache.get(targetGeohash);
    if (!target) {
      target = {
        geohash: targetGeohash,
        loos: [],
        fetchedAt: ancestor.fetchedAt,
        sourcePrecision: ancestor.sourcePrecision,
      };
      this.cache.set(targetGeohash, target);
    }

    return target;
  }

  private populateDerivedEntries(baseEntry: CachedEntry): void {
    const buckets = new Map<string, Map<string, TileLoo>>();
    const { geohash, sourcePrecision, fetchedAt } = baseEntry;

    for (const loo of baseEntry.loos) {
      if (!loo.geohash.startsWith(geohash)) {
        continue;
      }

      const maxLength = Math.min(MAX_DERIVED_PRECISION, loo.geohash.length);
      for (let length = sourcePrecision + 1; length <= maxLength; length += 1) {
        const prefix = loo.geohash.slice(0, length);
        let bucket = buckets.get(prefix);
        if (!bucket) {
          bucket = new Map<string, TileLoo>();
          buckets.set(prefix, bucket);
        }
        bucket.set(loo.id, loo);
      }
    }

    for (const [prefix, bucket] of buckets.entries()) {
      const entry: CachedEntry = {
        geohash: prefix,
        loos: Array.from(bucket.values()),
        fetchedAt,
        sourcePrecision,
      };
      this.cache.set(prefix, entry);
    }
  }

  private deleteDerivedEntries(prefix: string, sourcePrecision: number): void {
    for (const key of Array.from(this.cache.keys())) {
      if (!key.startsWith(prefix)) {
        continue;
      }

      if (key === prefix) {
        this.cache.delete(key);
        continue;
      }

      const entry = this.cache.get(key);
      if (!entry || entry.sourcePrecision <= sourcePrecision) {
        this.cache.delete(key);
      }
    }
  }

  private schedulePersist(force = false): void {
    if (!this.storage) {
      return;
    }

    if (force) {
      if (this.persistTimer) {
        clearTimeout(this.persistTimer);
        this.persistTimer = null;
      }
      this.flushToStorage();
      return;
    }

    if (this.persistTimer) {
      return;
    }

    this.persistTimer = setTimeout(() => {
      this.persistTimer = null;
      this.flushToStorage();
    }, PERSIST_DEBOUNCE_MS);
  }

  private resolveStorage(): Storage | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      return window.localStorage;
    } catch (error) {
      console.warn('[LooTileCache] Local storage unavailable', error);
      return null;
    }
  }

  private restoreFromStorage(): void {
    if (!this.storage) {
      return;
    }

    try {
      const raw = this.storage.getItem(CACHE_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SerializedTileCache>;
      if (parsed?.version !== CACHE_STORAGE_VERSION || !Array.isArray(parsed.tiles)) {
        return;
      }

      const now = Date.now();
      const maxAge = this.ttlMs * 6;
      let pruned = false;

      for (const entry of parsed.tiles) {
        if (!entry || typeof entry.geohash !== 'string' || !Array.isArray(entry.loos)) {
          pruned = true;
          continue;
        }

        const fetchedAt = typeof entry.fetchedAt === 'number' ? entry.fetchedAt : now;
        if (now - fetchedAt > maxAge) {
          pruned = true;
          continue;
        }

        const clonedLoos = entry.loos.map((loo) => ({ ...loo }));
        const sourcePrecision =
          typeof entry.sourcePrecision === 'number'
            ? entry.sourcePrecision
            : entry.geohash.length;

        this.cache.set(entry.geohash, {
          geohash: entry.geohash,
          loos: dedupeLoosById(clonedLoos),
          fetchedAt,
          sourcePrecision,
        });
      }

      if (pruned) {
        this.schedulePersist();
      }
    } catch (error) {
      console.warn('[LooTileCache] Failed to restore cache from storage', error);
    }
  }

  private flushToStorage(): void {
    if (!this.storage) {
      return;
    }

    try {
      const now = Date.now();
      const maxAge = this.ttlMs * 6;
      const tiles = Array.from(this.cache.values())
        .filter((tile) => tile.sourcePrecision === tile.geohash.length)
        .filter((tile) => now - tile.fetchedAt <= maxAge)
        .sort((a, b) => b.fetchedAt - a.fetchedAt)
        .slice(0, MAX_PERSISTED_ENTRIES)
        .map((tile) => ({
          geohash: tile.geohash,
          fetchedAt: tile.fetchedAt,
          sourcePrecision: tile.sourcePrecision,
          loos: tile.loos.map((loo) => ({ ...loo })),
        }));

      const payload: SerializedTileCache = {
        version: CACHE_STORAGE_VERSION,
        tiles,
      };

      this.storage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn('[LooTileCache] Failed to persist cache to storage', error);
    }
  }
}

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT ?? '/api/graphql';

export const graphQLClient = new GraphQLClient(endpoint);

export const looTileCache = new LooTileCache(graphQLClient);

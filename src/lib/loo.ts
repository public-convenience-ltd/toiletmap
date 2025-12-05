import ngeohash from 'ngeohash';
import { Loo } from '../@types/resolvers-types';
import { FILTER_TYPE, genLooFilterBitmask } from './filter';

type CompressedLooString = `${string}|${string}|${number}`;
type CompressedFullLooString = `${string}|${string}|${number}|${string}`;

type OpeningTimesValue = NonNullable<Loo['openingTimes']>;

type BufferLike = {
  from(input: string, encoding?: string): {
    toString(encoding: string): string;
  };
};

type FullLooMeta = {
  n?: string;
  p?: string;
  t?: string;
  o?: string;
};

const getGlobalBuffer = (): BufferLike | undefined => {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }
  const maybeBuffer = (globalThis as { Buffer?: BufferLike }).Buffer;
  return typeof maybeBuffer === 'undefined' ? undefined : maybeBuffer;
};

const toBinary = (value: string) =>
  encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex: string) =>
    String.fromCharCode(Number.parseInt(hex, 16)),
  );

const fromBinary = (value: string) =>
  decodeURIComponent(
    Array.from(value)
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );

const base64UrlEncode = (value: string): string => {
  if (!value) {
    return '';
  }

  const bufferClass = getGlobalBuffer();

  if (bufferClass) {
    return bufferClass
      .from(value, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/u, '');
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.btoa === 'function') {
    const binary = toBinary(value);
    return globalThis
      .btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/u, '');
  }

  return value;
};

const padBase64 = (value: string) =>
  value.padEnd(
    value.length + ((4 - (value.length % 4 || 4)) % 4),
    '=',
  );

const base64UrlDecode = (value: string): string => {
  if (!value) {
    return '';
  }

  const normalized = padBase64(
    value.replace(/-/g, '+').replace(/_/g, '/'),
  );

  const bufferClass = getGlobalBuffer();

  if (bufferClass) {
    return bufferClass.from(normalized, 'base64').toString('utf8');
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(normalized);
    return fromBinary(binary);
  }

  return value;
};

const filterMaskOnly =
  FILTER_TYPE.NO_PAYMENT |
  FILTER_TYPE.ALL_GENDER |
  FILTER_TYPE.AUTOMATIC |
  FILTER_TYPE.ACCESSIBLE |
  FILTER_TYPE.BABY_CHNG |
  FILTER_TYPE.RADAR;

const filterBitLength = Math.ceil(Math.log2(filterMaskOnly + 1));

const DETAIL_OFFSETS = {
  women: 0,
  men: 2,
  children: 4,
  urinalOnly: 6,
} as const;

const encodeTriState = (value: boolean | null | undefined) => {
  if (value === true) {
    return 1;
  }
  if (value === false) {
    return 2;
  }
  return 0;
};

const decodeTriState = (value: number): boolean | null => {
  if (value === 1) {
    return true;
  }
  if (value === 2) {
    return false;
  }
  return null;
};

const encodeDetailsMask = (loo: Loo) => {
  const encodedWomen = encodeTriState(loo.women) << DETAIL_OFFSETS.women;
  const encodedMen = encodeTriState(loo.men) << DETAIL_OFFSETS.men;
  const encodedChildren = encodeTriState(loo.children) << DETAIL_OFFSETS.children;
  const encodedUrinalOnly =
    encodeTriState(loo.urinalOnly) << DETAIL_OFFSETS.urinalOnly;

  return encodedWomen | encodedMen | encodedChildren | encodedUrinalOnly;
};

const decodeDetailsMask = (mask: number) => ({
  women: decodeTriState((mask >> DETAIL_OFFSETS.women) & 0b11),
  men: decodeTriState((mask >> DETAIL_OFFSETS.men) & 0b11),
  children: decodeTriState((mask >> DETAIL_OFFSETS.children) & 0b11),
  urinalOnly: decodeTriState((mask >> DETAIL_OFFSETS.urinalOnly) & 0b11),
});

const compressOpeningTimes = (
  openingTimes: Loo['openingTimes'],
): string | undefined => {
  if (!Array.isArray(openingTimes)) {
    return undefined;
  }

  return openingTimes
    .map((item) => {
      if (!Array.isArray(item) || item.length === 0) {
        return '';
      }
      const [start, end] = item;
      if (!start || !end) {
        return '';
      }
      return `${start.replace(':', '')}${end.replace(':', '')}`;
    })
    .join('.');
};

const decompressOpeningTimes = (
  encoded?: string,
): OpeningTimesValue | undefined => {
  if (typeof encoded !== 'string') {
    return undefined;
  }

  const segments = encoded.split('.');

  return Array.from({ length: 7 }).map((_, index) => {
    const value = segments[index] ?? '';

    if (!value) {
      return [];
    }

    const formatted = (input: string) => `${input.slice(0, 2)}:${input.slice(2)}`;

    return [formatted(value.slice(0, 4)), formatted(value.slice(4, 8))];
  }) as OpeningTimesValue;
};

const encodeMeta = (loo: Loo): string => {
  const meta: FullLooMeta = {};

  if (loo.name) {
    meta.n = loo.name;
  }

  if (loo.paymentDetails) {
    meta.p = loo.paymentDetails;
  }

  if (loo.notes) {
    meta.t = loo.notes;
  }

  const openingTimes = compressOpeningTimes(loo.openingTimes);
  if (typeof openingTimes !== 'undefined') {
    meta.o = openingTimes;
  }

  if (Object.keys(meta).length === 0) {
    return '';
  }

  return base64UrlEncode(JSON.stringify(meta));
};

const decodeMeta = (encodedMeta: string) => {
  if (!encodedMeta) {
    return {};
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(encodedMeta)) as FullLooMeta;
    return {
      name: decoded.n,
      paymentDetails: decoded.p,
      notes: decoded.t,
      openingTimes: decompressOpeningTimes(decoded.o),
    };
  } catch {
    return {};
  }
};

const compressBaseLoo = (loo: Loo) => {
  const id = loo.id;
  const { lat, lng } = loo.location!;
  const geohash = ngeohash.encode(lat, lng, 9);
  const filterMask = genLooFilterBitmask(loo);

  return {
    id,
    geohash,
    filterMask,
  };
};

const getLocationFromGeohash = (geohash: string) => {
  const { latitude, longitude } = ngeohash.decode(geohash);
  return {
    lng: longitude,
    lat: latitude,
  };
};

export type CompressedLooObject = {
  id: string;
  location: {
    lng: number;
    lat: number;
  };
  filterBitmask: number;
};

export type CompressedFullLooObject = CompressedLooObject & {
  detailBitmask: number;
  details: {
    women: boolean | null;
    men: boolean | null;
    children: boolean | null;
    urinalOnly: boolean | null;
  };
  paymentDetails?: string;
  notes?: string;
  openingTimes?: OpeningTimesValue;
  name?: string;
};

export const stringifyAndCompressLoos = (loos: Loo[]): CompressedLooString[] =>
  loos.map((loo) => {
    const base = compressBaseLoo(loo);

    return `${base.id}|${base.geohash}|${base.filterMask}` as CompressedLooString;
  });

export const stringifyAndCompressFullLoos = (
  loos: Loo[],
): CompressedFullLooString[] =>
  loos.map((loo) => {
    const base = compressBaseLoo(loo);
    const detailMask = encodeDetailsMask(loo);
    const combinedMask = base.filterMask | (detailMask << filterBitLength);
    const meta = encodeMeta(loo);

    return `${base.id}|${base.geohash}|${combinedMask}|${meta}` as CompressedFullLooString;
  });

export const parseCompressedLoo = (
  compressedLoo: CompressedLooString,
): CompressedLooObject => {
  const loo = compressedLoo.split('|');
  const [looId, geohash, filterBitmask] = loo;

  return {
    id: looId,
    location: getLocationFromGeohash(geohash),
    filterBitmask: Number.parseInt(filterBitmask, 10),
  };
};

export const parseCompressedFullLoo = (
  compressedLoo: CompressedFullLooString,
): CompressedFullLooObject => {
  const loo = compressedLoo.split('|');
  const [looId, geohash, combinedMask, metaSegment = ''] = loo;
  const maskNumber = Number.parseInt(combinedMask, 10);
  const detailMask = maskNumber >> filterBitLength;
  const filterBitmask = maskNumber & filterMaskOnly;

  const meta = decodeMeta(metaSegment);

  return {
    id: looId,
    location: getLocationFromGeohash(geohash),
    filterBitmask,
    detailBitmask: detailMask,
    details: decodeDetailsMask(detailMask),
    ...meta,
  };
};

export const filterCompressedLooByAppliedFilters = (
  compressedLoo: CompressedLooObject,
  appliedFilters: Array<FILTER_TYPE>
) => {
  if (appliedFilters.length === 0) {
    return true;
  }

  // Check that the loo passes all of the applied filters.
  const passesAll = appliedFilters.reduce((previousValue, currentFilter) => {
    const currentFilterInMask =
      (compressedLoo.filterBitmask & currentFilter) !== 0;
    return previousValue && currentFilterInMask;
  }, true);

  return passesAll;
};

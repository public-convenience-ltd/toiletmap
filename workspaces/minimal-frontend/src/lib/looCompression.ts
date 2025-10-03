import ngeohash from 'ngeohash';

const FILTER_FLAGS = {
  NO_PAYMENT: 0b00000001,
  ALL_GENDER: 0b00000010,
  AUTOMATIC: 0b00000100,
  ACCESSIBLE: 0b00001000,
  BABY_CHANGE: 0b00010000,
  RADAR: 0b00100000,
} as const;

export interface TileLoo {
  id: string;
  geohash: string;
  location: {
    lat: number;
    lng: number;
  };
  name?: string | null;
  noPayment: boolean;
  allGender: boolean;
  automatic: boolean;
  accessible: boolean;
  babyChange: boolean;
  radar: boolean;
}

export const parseCompressedLoo = (compressed: string): TileLoo => {
  const [id, geohash, filterBitmaskRaw] = compressed.split('|');
  const filterBitmask = Number.parseInt(filterBitmaskRaw ?? '0', 10);

  const { latitude, longitude } = ngeohash.decode(geohash);

  const hasFlag = (flag: number) => (filterBitmask & flag) !== 0;

  return {
    id,
    geohash,
    location: {
      lat: latitude,
      lng: longitude,
    },
    name: null,
    noPayment: hasFlag(FILTER_FLAGS.NO_PAYMENT),
    allGender: hasFlag(FILTER_FLAGS.ALL_GENDER),
    automatic: hasFlag(FILTER_FLAGS.AUTOMATIC),
    accessible: hasFlag(FILTER_FLAGS.ACCESSIBLE),
    babyChange: hasFlag(FILTER_FLAGS.BABY_CHANGE),
    radar: hasFlag(FILTER_FLAGS.RADAR),
  };
};

export const dedupeLoosById = (loos: TileLoo[]): TileLoo[] => {
  const map = new Map<string, TileLoo>();
  for (const loo of loos) {
    map.set(loo.id, loo);
  }
  return Array.from(map.values());
};

import { Loo } from '../api-client/graphql';
import { FILTER_TYPE, genLooFilterBitmask } from './filter';

export type LooProperties = Omit<Loo, '__typename'> & {
  geometry: {
    coordinates: [number, number];
  };
};

type CompressedLooString = `${string}|${string}|${string}|${number}`;

type CompressedLooObject = {
  id: string;
  location: {
    lng: number;
    lat: number;
  };
  filterBitmask: number;
};

export const stringifyAndCompressLoos = (
  loos: { id?: string; properties: LooProperties }[]
): CompressedLooString[] =>
  loos.map((loo) => {
    const id = loo.id;
    const lat = loo.properties.geometry.coordinates[0].toFixed(4);
    const lng = loo.properties.geometry.coordinates[1].toFixed(4);
    const filterMask = genLooFilterBitmask(loo);
    return `${id}|${lat}|${lng}|${filterMask}` as CompressedLooString;
  });

export const parseCompressedLoo = (
  compressedLoo: CompressedLooString
): CompressedLooObject => {
  const loo = compressedLoo.split('|');
  return {
    id: loo[0],
    location: {
      lng: parseFloat(loo[1]),
      lat: parseFloat(loo[2]),
    },
    filterBitmask: parseInt(loo[3], 10),
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

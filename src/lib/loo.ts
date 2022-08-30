import type { LatLngLiteral } from 'leaflet';
import ngeohash from 'ngeohash';
import { Loo } from '../api-client/graphql';
import { FILTER_TYPE, genLooFilterBitmask } from './filter';

export type LooProperties = Omit<Loo, '__typename'> & {
  geometry: {
    coordinates: [number, number];
  };
};

type CompressedLooString = `${string}|${string}|${number}`;

export type CompressedLooObject = {
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
    const [longitude, latitude] = loo.properties.geometry.coordinates;
    const geohash = ngeohash.encode(latitude, longitude, 9);
    const filterMask = genLooFilterBitmask(loo);
    return `${id}|${geohash}|${filterMask}` as CompressedLooString;
  });

export const parseCompressedLoo = (
  compressedLoo: CompressedLooString
): CompressedLooObject => {
  const loo = compressedLoo.split('|');
  const [looId, geohash, filterBitmask] = loo;
  const { latitude, longitude } = ngeohash.decode(geohash);

  return {
    id: looId,
    location: {
      lng: longitude,
      lat: latitude,
    },
    filterBitmask: parseInt(filterBitmask, 10),
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

export const fitMapBoundsToUserLocationNeighbouringTiles = (
  userLocation: LatLngLiteral,
  map: L.Map
) => {
  //find neighbouring tiles of the user's location and set the map bounds to fit them
  const encodedLocationFound = ngeohash.encode(
    userLocation.lat,
    userLocation.lng,
    6
  );
  const neighbors = ngeohash.neighbors(encodedLocationFound);
  const { latitude: cornerNWLat, longitude: cornerNWLon } = ngeohash.decode(
    neighbors[7]
  );
  const { latitude: cornerSELat, longitude: cornerSELon } = ngeohash.decode(
    neighbors[3]
  );
  map.fitBounds([
    [cornerNWLat, cornerNWLon],
    [cornerSELat, cornerSELon],
  ]);
};

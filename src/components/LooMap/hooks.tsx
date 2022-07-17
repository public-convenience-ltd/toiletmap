import { useApolloClient } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';
import {
  filterCompressedLooByAppliedFilters,
  parseCompressedLoo,
} from '../../lib/loo';
import { useMapState } from '../MapState';
import loosByGeohash from '../../api-client/operations/loosByGeohash.graphql';
import config, { Filter } from '../../config';
import { getAppliedFiltersAsFilterTypes } from '../../lib/filter';

export const useMapGeohashPrecision = () => {
  // const map = useMap();
  // const zoom = map.getZoom();
  return useMemo(() => {
    // For now we abandon a more dynamic system in favour of only loading tiles at once scale
    // This is to save the number of requests that we make to the api (and subsequently mongo)
    // for each individual client, until we figure out an efficient caching system for our
    // tiles.
    return 3;

    // switch (true) {
    //   case zoom < 8:
    //     return 2;
    //   case zoom < 11:
    //     return 3;
    //   case zoom < 13:
    //     return 4;
    //   default:
    //     return 5;
    // }
  }, []);
};

export const useMapClusterRadius = () => {
  const map = useMap();
  const zoom = map.getZoom();
  return useMemo(() => {
    switch (true) {
      case zoom < 8:
        return 200;
      case zoom < 10:
        return 100;
      case zoom < 14:
        return 100;
      case zoom < 17:
        return 60;
      case zoom < 18:
        return 20;
      default:
        return 0;
    }
  }, [zoom]);
};

export const useRetrieveCachedLoos = (geohashes: string[]) => {
  const apolloClientCache = useApolloClient().cache;
  const [mapState] = useMapState();

  const { appliedFilters: filters } = mapState;
  const applied: Array<Filter> = config.filters.filter(
    (filter) => filters?.[filter.id]
  );
  const appliedFilterTypes = getAppliedFiltersAsFilterTypes(applied);

  return useMemo(() => {
    const allLoaded = geohashes.every(
      (geohash) => typeof mapState.geohashLoadState[geohash] !== 'undefined'
    );
    if (allLoaded) {
      return geohashes.flatMap((geohash) =>
        apolloClientCache
          .readQuery<{ loosByGeohash: string[] }>({
            query: loosByGeohash,
            variables: { geohash },
          })
          .loosByGeohash.map(parseCompressedLoo)
          .filter((compressedLoo) =>
            filterCompressedLooByAppliedFilters(
              compressedLoo,
              appliedFilterTypes
            )
          )
      );
    }
  }, [
    geohashes,
    mapState.geohashLoadState,
    apolloClientCache,
    appliedFilterTypes,
  ]);
};

export const useIsUserInteractingWithMap = () => {
  const map = useMap();
  const [userInteractingWithMap, setUserInteractingWithMap] = useState(false);
  useEffect(() => {
    map.on('moveend', () =>
      setTimeout(() => setUserInteractingWithMap(false), 100)
    );
    map.on('zoomend', () =>
      setTimeout(() => setUserInteractingWithMap(false), 100)
    );

    map.on('zoomstart', () => setUserInteractingWithMap(true));
    map.on('movestart', () => setUserInteractingWithMap(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return userInteractingWithMap;
};

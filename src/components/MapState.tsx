import { Map } from 'leaflet';
import React, { Dispatch, useEffect } from 'react';
import { Loo } from '../api-client/graphql';
import config, { BASEMAP_KEY, Filters, FILTERS_KEY } from '../config';

import { UseLocateMapControl } from './LooMap/useLocateMapControl';

const MapStateContext =
  React.createContext<[MapState, Dispatch<MapState>]>(null);

interface MapState {
  center?: {
    lat: number;
    lng: number;
  };
  searchLocation?: {
    lat: number;
    lng: number;
  };
  geolocation?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  appliedFilters?: Record<Filters, boolean>;
  focus?: Loo;
  map?: Map;
  locationServices?: UseLocateMapControl;
  currentlyLoadedGeohashes?: string[];
  geohashLoadState?: Record<string, boolean>;
  useProtomaps?: boolean;
}

const reducer = (state: MapState, newState: MapState) => {
  return {
    ...state,
    ...newState,
  };
};

export const MapStateProvider = ({ children }) => {
  const initialFilterState = config.getSettings(FILTERS_KEY) || [];
  const useProtomaps = config.getSettings(BASEMAP_KEY) === 'protomaps';

  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    // eslint-disable-next-line functional/immutable-data
    initialFilterState[filter.id] = initialFilterState?.[filter.id] || false;
  });

  const [state, setState] = React.useReducer(reducer, {
    center: config.fallbackLocation,
    zoom: 16,
    appliedFilters: initialFilterState,
    searchLocation: undefined,
    geohashLoadState: {},
    currentlyLoadedGeohashes: [],
    useProtomaps,
  } satisfies MapState);

  // keep local storage and state in sync
  useEffect(() => {
    window.localStorage.setItem(
      FILTERS_KEY,
      JSON.stringify(state.appliedFilters || {}),
    );
    window.localStorage.setItem(
      BASEMAP_KEY,
      JSON.stringify(state.useProtomaps ? 'protomaps' : 'osm'),
    );
  }, [state]);

  return (
    <MapStateContext.Provider value={[state, setState]}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapState = () => React.useContext(MapStateContext);

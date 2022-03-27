import { Map } from 'leaflet';
import React, { Dispatch, useEffect } from 'react';
import { Loo } from '../api-client/graphql';
import config, { Filter, FILTERS_KEY } from '../config';
import { CompressedLooObject } from '../lib/loo';
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
  appliedFilters?: Filter[];
  focus?: Loo;
  map?: Map;
  locationServices?: UseLocateMapControl;
  loadedGroups?: Record<string, CompressedLooObject>;
}

const reducer = (state: MapState, newState: MapState) => {
  return {
    ...state,
    ...newState,
  };
};

export const MapStateProvider = ({ children }) => {
  const initialFilterState = config.getSettings(FILTERS_KEY) || [];
  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialFilterState[filter.id] = initialFilterState[filter.id] || false;
  });

  const [state, setState] = React.useReducer(reducer, {
    center: config.fallbackLocation,
    zoom: 16,
    appliedFilters: initialFilterState,
    searchLocation: undefined,
    loadedGroups: {},
  });

  // keep local storage and state in sync
  useEffect(() => {
    window.localStorage.setItem(
      FILTERS_KEY,
      JSON.stringify(state.appliedFilters)
    );
  }, [state]);

  return (
    <MapStateContext.Provider value={[state, setState]}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapState = () => React.useContext(MapStateContext);

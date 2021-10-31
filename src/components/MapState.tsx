import React from 'react';
import config from '../config';

const MapStateContext = React.createContext(null);

const reducer = (state, newState) => {
  return {
    ...state,
    ...newState,
  };
};

export const MapStateProvider = ({ children, loos = [] }) => {
  const [state, setState] = React.useReducer(reducer, {
    center: config.fallbackLocation,
    zoom: 16,
    radius: 1000,
    geolocation: null,
    loos: loos,
  });
  return (
    <MapStateContext.Provider value={[state, setState]}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapState = () => React.useContext(MapStateContext);

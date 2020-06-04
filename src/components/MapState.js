import React from 'react';
import config from '../config';

const MapStateContext = React.createContext();

export const MapStateProvider = ({ children }) => {
  const [state, setState] = React.useState({
    center: config.fallbackLocation,
    zoom: 16,
    radius: 1000,
    geolocation: null,
  });

  const mergeState = React.useCallback(
    (newState) => {
      setState({
        ...state,
        ...newState,
      });
    },
    [setState, state]
  );

  return (
    <MapStateContext.Provider value={[state, mergeState]}>
      {children}
    </MapStateContext.Provider>
  );
};

export const useMapState = () => React.useContext(MapStateContext);

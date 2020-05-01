import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// import useGeolocation from './useGeolocation';
import config from '../config';

const MAP_POSITION_QUERY = gql`
  {
    mapCenter @client {
      lat
      lng
    }
    mapZoom @client
    mapRadius @client
  }
`;

const SET_MAP_POSITION = gql`
  mutation setMapPosition(
    $lat: Number!
    $lng: Number!
    $radius: Number!
    $zoom: Number!
  ) {
    updateCenter(lat: $lat, lng: $lng) @client
    updateRadius(radius: $radius) @client
    updateZoom(zoom: $zoom) @client
  }
`;

/**
 * useMapPosition is a helper to get and set the global map state.
 * It will return:
 * 1. The current map state (center, zoom and radius) which can be used for querying nearby loos or passing to a map component.
 * 2. A function used to set the map state.
 */

const useMapPosition = () => {
  const { data } = useQuery(MAP_POSITION_QUERY);

  const [setMapPositionMutation] = useMutation(SET_MAP_POSITION);

  // useCallback is required so this function can be used in dependency arrays succesfully
  // https://overreacted.io/a-complete-guide-to-useeffect/#but-i-cant-put-this-function-inside-an-effect
  const setMapPosition = React.useCallback(
    ({ center, zoom, radius }) => {
      setMapPositionMutation({
        variables: {
          ...center,
          zoom,
          radius: radius,
        },
      });
    },
    [setMapPositionMutation]
  );

  // const { geolocation } = useGeolocation({ skip: !withGeolocation });

  const getMapCenter = () => {
    if (data.mapCenter.lat && data.mapCenter.lng) {
      return data.mapCenter;
    }

    // if (geolocation.lat && geolocation.lng) {
    //   return geolocation;
    // }

    return config.fallbackLocation;
  };

  return [
    {
      center: getMapCenter(),
      zoom: data.mapZoom,
      radius: data.mapRadius,
    },
    setMapPosition,
  ];
};

export default useMapPosition;

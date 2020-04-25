import { useQuery, useMutation, gql } from '@apollo/client';
import useGeolocation from './useGeolocation';

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

const useMapPosition = () => {
  const { data: mapPosition } = useQuery(MAP_POSITION_QUERY);

  const [setMapPositionMutation] = useMutation(SET_MAP_POSITION);

  const setMapPosition = ({ center, zoom, radius }) => {
    setMapPositionMutation({
      variables: {
        ...center,
        zoom,
        radius: radius,
      },
    });
  };

  const { geolocation } = useGeolocation();

  const getMapCenter = () => {
    if (mapPosition.mapCenter.lat && mapPosition.mapCenter.lng) {
      return mapPosition.mapCenter;
    }

    if (geolocation.latitude && geolocation.longitude) {
      return { lat: geolocation.latitude, lng: geolocation.longitude };
    }

    return config.fallbackLocation;
  };

  return [
    {
      center: getMapCenter(),
      zoom: mapPosition.mapZoom,
      radius: mapPosition.mapRadius,
    },
    setMapPosition,
  ];
};

export default useMapPosition;

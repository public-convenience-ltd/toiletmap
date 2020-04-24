import { useQuery, gql } from '@apollo/client';
import config from '../config';
import useGeolocation from './useGeolocation';
import useMapPosition from './useMapPosition';

const NEARBY_LOOS_QUERY = gql`
  query findLoosNearby($lat: Float!, $lng: Float!, $radius: Int!) {
    loosByProximity(from: { lat: $lat, lng: $lng, maxDistance: $radius }) {
      id
      name
      location {
        lat
        lng
      }
    }
  }
`;
const useNearbyLoos = () => {
  const [
    mapPosition = {},
    setMapPosition,
    mapPositionLoading,
  ] = useMapPosition();

  const { loading, data, error } = useQuery(NEARBY_LOOS_QUERY, {
    variables: {
      lat: mapPosition.mapCenter.lat,
      lng: mapPosition.mapCenter.lng,
      radius: Math.ceil(
        mapPosition.viewMap ? mapPosition.mapRadius : config.nearestRadius
      ),
    },
    skip: !mapPosition.mapCenter.lat || !mapPosition.mapCenter.lng,
  });

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

  const mapProps = {
    onMoveEnd: ({ center, zoom, radius }) => {
      setMapPosition({
        center,
        zoom,
        radius,
      });
    },
    center: getMapCenter(),
    zoom: mapPosition.mapZoom,
  };

  return {
    loading: mapPositionLoading || loading,
    data: data ? data.loosByProximity : [],
    error,
    mapProps,
  };
};

export default useNearbyLoos;

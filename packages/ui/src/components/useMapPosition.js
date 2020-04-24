import { useQuery, useMutation, gql } from '@apollo/client';

const MAP_POSITION_QUERY = gql`
  {
    mapCenter @client {
      lat
      lng
    }
    mapZoom @client
    mapRadius @client
    viewMap @client
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
  const { data, loading } = useQuery(MAP_POSITION_QUERY);

  const [setMapPositionMutation] = useMutation(SET_MAP_POSITION);

  const setMapPosition = ({ center, zoom, radius }) => {
    setMapPositionMutation({
      variables: {
        ...center,
        zoom,
        radius,
      },
    });
  };

  return [data, setMapPosition, loading];
};

export default useMapPosition;

import { useQuery, gql } from '@apollo/client';

const NEARBY_LOOS_QUERY = gql`
  query findLoosNearby($lat: Float!, $lng: Float!, $radius: Int!) {
    loosByProximity(from: { lat: $lat, lng: $lng, maxDistance: $radius }) {
      id
      name
      location {
        lat
        lng
      }
      noPayment
      allGender
      automatic
      accessible
      babyChange
      radar
    }
  }
`;

const useNearbyLoos = ({ variables, skip }) => {
  const { loading, data, error } = useQuery(NEARBY_LOOS_QUERY, {
    variables,
    skip,
  });

  return {
    data: data ? data.loosByProximity : [],
    loading,
    error,
  };
};

export default useNearbyLoos;

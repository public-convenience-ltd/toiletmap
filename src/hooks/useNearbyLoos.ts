import { useFindLoosNearby } from '../api-client/page';
import * as Types from '../api-client/graphql';

const useNearbyLoos = (variables: Types.FindLoosNearbyQueryVariables) => {
  const { data, error, loading } = useFindLoosNearby(() => ({
    variables,
  }));

  return {
    data: data !== undefined ? data.loosByProximity : [],
    loading: loading,
    error,
  };
};

export default useNearbyLoos;

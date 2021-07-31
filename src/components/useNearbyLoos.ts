import React from 'react';
import { useFindLoosNearby } from '../generated/page';
import * as Types from '../generated/graphql';
import { FindLoosNearbyQuery } from '../generated/graphql';


const useNearbyLoos = (variables: Types.FindLoosNearbyQueryVariables) => {
  const dataRef = React.useRef<FindLoosNearbyQuery>();

  const { data, error,loading } = useFindLoosNearby(() => ({
    variables
  }));
  

  // This is a hack to return the previous cache key's data if the new cache key's data is loading
  // https://github.com/vercel/swr/issues/192
  if (data !== undefined) {
    dataRef.current = data;
  }

  return {
    data: dataRef.current ? dataRef.current.loosByProximity : [],
    loading: loading,
    error,
  };
};

export default useNearbyLoos;

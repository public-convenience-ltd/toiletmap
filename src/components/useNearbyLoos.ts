import React from 'react';
import { useFindLoosNearby } from '../generated/page';
import * as Types from '../generated/graphql';
import { FindLoosNearbyQuery } from '../generated/graphql';


const useNearbyLoos = (variables: Types.FindLoosNearbyQueryVariables) => {

  const { data, error,loading } = useFindLoosNearby(() => ({
    variables
  }));
  

  return {
    data: data !== undefined ? data.loosByProximity : [],
    loading: loading,
    error,
  };
};

export default useNearbyLoos;

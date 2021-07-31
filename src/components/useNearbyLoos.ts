import React from 'react';
import useSWR from 'swr';
import { FindLoosNearbyQuery } from '../generated/graphql';
import { useFindLoosNearby } from '../generated/page';
import * as Types from '../generated/graphql';
import { QueryHookOptions, useQuery } from '@apollo/client';
// const FIND_NEARBY_LOOS_QUERY = `
//   query findLoosNearby($lat: Float!, $lng: Float!, $radius: Int!) {
//     loosByProximity(from: { lat: $lat, lng: $lng, maxDistance: $radius }) {
//       id
//       name
//       location {
//         lat
//         lng
//       }
//       noPayment
//       allGender
//       automatic
//       accessible
//       babyChange
//       radar
//       campaignUOL
//     }
//   }
// `;

const useNearbyLoos = (variables: Types.FindLoosNearbyQueryVariables) => {
  const dataRef = React.useRef();



  // const { isValidating, data, error } = useSWR([
  //   FIND_NEARBY_LOOS_QUERY,
  //   JSON.stringify(variables),
  // ]);

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

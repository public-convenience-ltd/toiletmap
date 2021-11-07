import { NextPage } from 'next';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';

import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
  let link;
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema');
    const { schema } = require('../pages/api');
    link = new SchemaLink({ schema });
  } else {
    link = createHttpLink({
      uri: '/api',
      credentials: 'same-origin',
      fetch,
    });
  }

  const cache = new InMemoryCache();
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache,
  });
}

/**
 * The big trick here is to merge the initialState from the pageprops with the client's current state see: https://developers.wpengine.com/blog/apollo-client-cache-rehydration-in-next-js
 * When we don't do theis the accumulates apolloState gets wiped out by any incoming static page props
 */
export function getApolloClient(
  initialState: NormalizedCacheObject | null = null
) {
  const _apolloClient = apolloClient ?? createApolloClient();
  // If a page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    console.log(initialState);
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState, existingCache, {
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data);
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export const withApollo = (Comp: NextPage) =>
  function ApolloWrapper(props: any) {
    return (
      <ApolloProvider client={getApolloClient(props.apolloState)}>
        <Comp />
      </ApolloProvider>
    );
  };

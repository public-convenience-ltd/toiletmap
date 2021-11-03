import { NextPage } from 'next';

import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import {
  NextApiRequestCookies,
  // @ts-ignore This path is generated at build time and conflicts otherwise
} from 'next-server/server/api-utils';
import { IncomingMessage } from 'http';

export type ApolloClientContext = {
  req?: IncomingMessage & {
    cookies: NextApiRequestCookies;
  };
};

export const withApollo = (Comp: NextPage) =>
  function ApolloWrapper(props: any) {
    return (
      <ApolloProvider client={getApolloClient(undefined, props.apolloState)}>
        <Comp />
      </ApolloProvider>
    );
  };

/**
 * Refactor this to reuse any existing apolloclinet in the client-side
 * merge the initialState from the pageprops with the client's current state see: https://developers.wpengine.com/blog/apollo-client-cache-rehydration-in-next-js
 */
export const getApolloClient = (
  ctx?: ApolloClientContext,
  initialState?: NormalizedCacheObject
) => {
  let link;
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema');
    const { schema } = require('../pages/api');
    link = new SchemaLink({ schema });
  } else {
    const url =
      process.env.NODE_ENV === 'development'
        ? process.env.AUTH0_BASE_URL
        : process.env.VERCEL_URL;
    link = createHttpLink({
      uri: typeof window === 'undefined' ? url + '/api' : '/api',
      fetch,
    });
  }

  const cache = new InMemoryCache().restore(initialState || {});
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link,
    cache,
  });
};

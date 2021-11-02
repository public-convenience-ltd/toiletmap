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
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.AUTH0_BASE_URL
      : process.env.VERCEL_URL;
  const httpLink = createHttpLink({
    uri: typeof window === 'undefined' ? url + '/api' : '/api',
    fetch,
  });

  const cache = new InMemoryCache().restore(initialState || {});
  return new ApolloClient({
    link: httpLink,
    cache,
  });
};

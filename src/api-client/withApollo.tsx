import { NextPage } from 'next';

import {
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  ApolloClient,
  type ApolloLink,
  type NormalizedCacheObject,
} from '@apollo/client';

import type { SchemaLink } from '@apollo/client/link/schema';

import authDirective from '../api/directives/authDirective';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  let terminatingLink: SchemaLink | ApolloLink;
  if (typeof window === 'undefined') {
    const { SchemaLink } = require('@apollo/client/link/schema');
    const schema = require('./schema').default;
    const { context } = require('../api/graphql/context');

    terminatingLink = new SchemaLink({
      schema: schema(authDirective),
      context,
    });
  } else {
    terminatingLink = createHttpLink({
      uri: '/api',
      credentials: 'same-origin',
      fetch,
      useGETForQueries: true,
    });
  }

  const cache = new InMemoryCache();
  const isRunningOnServer = typeof window === 'undefined';
  return new ApolloClient({
    ssrMode: isRunningOnServer,
    link: terminatingLink,
    cache,
    defaultOptions: {
      watchQuery: {
        // fetchPolicy: "cache-and-network",
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        // fetchPolicy: "network-only",
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
}

type GetApolloClient = (
  ...args: unknown[]
) => ApolloClient<NormalizedCacheObject>;
export const getApolloClient: GetApolloClient = () => {
  const _apolloClient = apolloClient ?? createApolloClient();

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withApollo<T extends NextPage<any>>(Component: T): T {
  const ApolloWrapper = (props: React.ComponentProps<T>) => (
    <ApolloProvider client={getApolloClient()}>
      <Component {...props} />
    </ApolloProvider>
  );
  return ApolloWrapper as T;
}

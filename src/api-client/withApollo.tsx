import { NextPage } from 'next';

import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

import { onError } from '@apollo/client/link/error';

import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import redactedDirective from '../api/directives/redactedDirective';
import authDirective from '../api/directives/authDirective';
import { sha256 } from 'crypto-hash';

let apolloClient: ApolloClient<NormalizedCacheObject> | undefined;

function createApolloClient() {
  let terminatingLink;
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { SchemaLink } = require('@apollo/client/link/schema');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: schema } = require('./schema');
    terminatingLink = new SchemaLink({
      schema: schema(authDirective, redactedDirective),
    });
  } else {
    terminatingLink = createHttpLink({
      uri: '/api',
      credentials: 'same-origin',
      fetch: (input, init) => {
        // Make sure we don't cache on the HTTP layer when we ask not to do so.
        const shouldInvalidateCache = init.headers['invalidatecache'];
        return fetch(input, {
          ...init,
          headers: {
            ...init.headers,
            ...(shouldInvalidateCache === true
              ? { 'cache-control': 'no-cache', pragma: 'no-cache' }
              : {}),
          },
        });
      },
    });
  }

  const HANDLED_ERRORS = ['OPENING_TIMES', 'INTERNAL_SERVER_ERROR'];

  const link = createPersistedQueryLink({
    sha256,
    useGETForHashedQueries: true,
  })
    .concat(
      onError(({ graphQLErrors, response, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            const { code } = extensions;
            console.log(
              'A caught Apollo client error was experienced: ',
              message
            );
            if (HANDLED_ERRORS.indexOf(code) > -1) {
              console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
              );
              // eslint-disable-next-line functional/immutable-data
              response.errors = response.errors.filter((error) => {
                error.extensions?.code === code;
              });
            }
          });
        if (networkError) console.log(`[Network error]: ${networkError}`);
      })
    )
    .concat(terminatingLink);

  const cache = new InMemoryCache();

  const isRunningOnServer = typeof window === 'undefined';
  const client = new ApolloClient({
    ssrMode: isRunningOnServer,
    link: link,
    cache,
  });

  return client;
}

/**
 * The big trick here is to merge the initialState from the pageprops with the client's current state see: https://developers.wpengine.com/blog/apollo-client-cache-rehydration-in-next-js
 * When we don't do the is the accumulates apolloState gets wiped out by any incoming static page props
 */
export function getApolloClient() {
  const _apolloClient = apolloClient ?? createApolloClient();

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient;

  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient;

  return _apolloClient;
}

export const withApollo = (Comp: NextPage) =>
  function ApolloWrapper(props: unknown) {
    return (
      <ApolloProvider client={getApolloClient()}>
        <Comp {...props} />
      </ApolloProvider>
    );
  };

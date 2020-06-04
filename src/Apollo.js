import React from 'react';
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { onError } from '@apollo/link-error';
import { setContext } from '@apollo/link-context';

import { version } from '../package.json';
import { isAuthenticated, getAccessToken } from './Auth';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Return existing cached data for find by id queries (use `returnPartialData` option)
        loo(existingData, { args, toReference }) {
          return (
            existingData || toReference({ __typename: 'Loo', id: args.id })
          );
        },
      },
    },
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = new HttpLink({
  uri: '/api',
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: isAuthenticated() ? `Bearer ${getAccessToken()}` : '',
    },
  };
});

const client = new ApolloClient({
  name: '@toiletmap/ui',
  version,
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  connectToDevTools: true,
  cache,
});

const CustomApolloProvider = (props) => (
  <ApolloProvider client={client} {...props} />
);

export default CustomApolloProvider;

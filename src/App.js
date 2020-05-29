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
import { gql } from 'graphql.macro';

import { useAuth } from './Auth';
import localSchema from './localSchema';
import { version } from '../package.json';

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
  uri: process.env.REACT_APP_BAKED_BACKEND || '/api',
});

const App = (props) => {
  const auth = useAuth();

  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        authorization: auth.isAuthenticated()
          ? `Bearer ${auth.getAccessToken()}`
          : '',
      },
    };
  });

  const client = new ApolloClient({
    name: '@toiletmap/ui',
    version,
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    connectToDevTools: true,
    cache,
    ...localSchema,
  });

  // set the initial cache state
  function writeInitialState() {
    const isAuthenticated = auth.isAuthenticated();

    cache.writeQuery({
      query: gql`
        query {
          mapZoom
          mapRadius
          mapCenter {
            lat
            lng
          }
          geolocation {
            lat
            lng
          }
          userData {
            loggedIn
            name
          }
        }
      `,
      data: {
        mapZoom: 16,
        mapRadius: 1000,
        mapCenter: {
          __typename: 'Point',
          lat: 0,
          lng: 0,
        },
        geolocation: null,
        userData: {
          __typename: 'UserData',
          loggedIn: isAuthenticated,
          name: isAuthenticated ? auth.getProfile().name : null,
        },
      },
    });
  }

  writeInitialState();

  // resetStore isn't used anywhere yet, but just in case...
  client.onResetStore(writeInitialState);

  return <ApolloProvider client={client} children={props.children} />;
};

export default App;

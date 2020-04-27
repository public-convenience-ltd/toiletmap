// Polyfills
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/string/repeat';
import 'core-js/features/object/entries';
import 'core-js/features/object/assign';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

// Global CSS
import './css/global';

import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import LooPage from './pages/LooPage';
import RemovePage from './pages/RemovePage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddPage from './pages/AddPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import PreferencesPage from './pages/PreferencesPage';
import MapPage from './pages/MapPage';
import UseOurLoosPage from './pages/UseOurLoosPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFound from './pages/404';
import Tracking from './components/Tracking';
import PageLoading from './components/PageLoading';

import history from './history';
import Auth from './Auth';
import localSchema from './localSchema';
import Router from './Router';

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
import { gql } from 'graphql.macro';

const Explorer = lazy(() => import('./explorer'));

const auth = new Auth();

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_BAKED_BACKEND || '/api',
});

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

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

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

const client = new ApolloClient({
  name: '@toiletmap/ui',
  version: version,
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  connectToDevTools: true,
  cache,
  ...localSchema,
});

// Set the initial cache state
function writeInitialState() {
  let isAuthed = auth.isAuthenticated();
  cache.writeQuery({
    query: gql`
      query {
        mapZoom
        mapRadius
        mapCenter {
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
      userData: {
        __typename: 'UserData',
        loggedIn: isAuthed,
        name: isAuthed ? auth.getProfile().name : null,
      },
    },
  });
}
writeInitialState();
// resetStore isn't used anywhere yet, but just in case...
client.onResetStore(writeInitialState);

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router history={history} forceRefresh={false}>
      <Tracking />
      <Suspense fallback={<PageLoading />}>
        <Switch>
          <Route
            exact
            path="/"
            render={(props) => <HomePage auth={auth} {...props} />}
          />
          <Route exact path="/preferences" component={PreferencesPage} />
          <Route exact path="/about" component={AboutPage} />
          <Route exact path="/privacy" component={PrivacyPage} />
          <Route exact path="/use-our-loos" component={UseOurLoosPage} />
          <Route path="/loos/:id" exact component={LooPage} />
          <Route
            path="/login"
            render={(props) => <LoginPage auth={auth} {...props} />}
          />
          <Route
            path="/map/:lng/:lat"
            render={(props) => <MapPage auth={auth} {...props} />}
          />
          <Route
            exact
            path="/callback"
            render={(props) => <AuthCallback auth={auth} {...props} />}
          />
          <Route
            path="/explorer"
            render={(props) => <Explorer auth={auth} {...props} />}
          />
          <ProtectedRoute
            exact
            path="/report"
            auth={auth}
            injectProps={{ cache }}
            component={AddPage}
          />
          <ProtectedRoute
            path="/loos/:id/edit"
            auth={auth}
            injectProps={{ cache }}
            component={EditPage}
          />
          <ProtectedRoute
            path="/loos/:id/remove"
            component={RemovePage}
            auth={auth}
          />
          <ProtectedRoute
            path="/loos/:id/thanks"
            component={LooPage}
            auth={auth}
          />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
);

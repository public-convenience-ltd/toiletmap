import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Statistics from './components/Statistics';
import HeadlineStats from './components/stats/HeadlineStats';
import AreaComparisonStats from './components/stats/AreaComparisonStats';
import Search from './components/Search';
import LooView from './components/LooView';
import AuthCallback from './components/AuthCallback';

import * as serviceWorker from './serviceWorker';
import { version } from '../package.json';

import './css/index.css';

import Auth from './Auth';
const auth = new Auth();

const client = new ApolloClient({
  name: 'Toilet Map Explorer',
  version: version,
  uri: process.env.REACT_APP_GBPTM_GRAPHQL || '/graphql',
  request: operation => {
    if (auth.isAuthenticated()) {
      operation.setContext({
        headers: {
          Authorization: `Bearer ${auth.getAccessToken()}`,
        },
      });
    }
    return operation;
  },
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <Router>
      <AppLayout path="/explorer" auth={auth}>
        <Home default path="home" />
        <AuthCallback path="callback" auth={auth} />
        <Search path="search" auth={auth} />
        <LooView path="loos/:id" auth={auth} />
        <Statistics path="statistics">
          <HeadlineStats default />
          <AreaComparisonStats path="areas" />
        </Statistics>
      </AppLayout>
    </Router>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

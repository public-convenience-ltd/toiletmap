import React from 'react';
import ReactDOM from 'react-dom';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Statistics from './components/Statistics';
import HeadlineStats from './components/stats/HeadlineStats';
import AreaComparisonStats from './components/stats/AreaComparisonStats';
import Search from './components/Search';
import LooView from './components/LooView';
import AuthCallback from './components/AuthCallback';

import * as serviceWorker from './serviceWorker';

import './css/index.css';

import { Router } from '@reach/router';

import Auth from './Auth';
const auth = new Auth();

ReactDOM.render(
  <Router>
    <AppLayout path="/explorer" auth={auth}>
      <Home default path="home" />
      <AuthCallback path="callback" auth={auth} />
      <Search path="search" />
      <LooView path="loos/:looId" auth={auth} />
      <Statistics path="statistics">
        <HeadlineStats default />
        <AreaComparisonStats path="areas" />
      </Statistics>
    </AppLayout>
  </Router>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

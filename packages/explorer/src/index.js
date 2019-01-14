import React from 'react';
import ReactDOM from 'react-dom';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Statistics from './components/Statistics';
import HeadlineStats from './components/stats/HeadlineStats';
import AreaComparisonStats from './components/stats/AreaComparisonStats';
import Search from './components/Search';
import LooView from './components/LooView';

import * as serviceWorker from './serviceWorker';

import './css/index.css';

import { Router } from '@reach/router';

ReactDOM.render(
  <Router>
    <AppLayout path="/explorer">
      <Home default path="home" />
      <Search path="search" />
      <LooView path="loos/:looId" />
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

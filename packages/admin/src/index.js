import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Statistics from './components/Statistics';
import HeadlineStats from './components/stats/HeadlineStats';
import AreaComparisonStats from './components/stats/AreaComparisonStats';
import Search from './components/Search';
import LooView from './components/LooView';

import './css/index.css';

import { Router } from '@reach/router';

ReactDOM.render(
  <Router>
    <AppLayout path="/admin">
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
registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Statistics from './components/Statistics';
import HeadlineStats from './components/stats/HeadlineStats';
import AreaComparisonStats from './components/stats/AreaComparisonStats';
import Search from './components/Search';
//import Tools from './components/Tools';

import './css/index.css';

import { Router } from '@reach/router';

ReactDOM.render(
  <Router>
    <AppLayout path="/">
      <Home path="/" />
      <Search path="search" />
      <Statistics path="statistics">
        <HeadlineStats default />
        <AreaComparisonStats path="areas" />
      </Statistics>
      {/* <Route path="tools" component={Tools}/> */}
    </AppLayout>
  </Router>,
  document.getElementById('root')
);
registerServiceWorker();

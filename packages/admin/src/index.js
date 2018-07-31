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

import {
  Router,
  Route,
  IndexRoute,
  IndexRedirect,
  hashHistory,
} from 'react-router';

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={AppLayout}>
      <IndexRedirect to="search" />
      <Route path="home" component={Home} />
      <Route path="search" component={Search} />
      <Route path="statistics" component={Statistics}>
        <IndexRoute component={HeadlineStats} />
        <Route path="areas" component={AreaComparisonStats} />
      </Route>

      {/* <Route path="tools" component={Tools}/> */}
    </Route>
  </Router>,
  document.getElementById('root')
);
registerServiceWorker();

import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import Layout from './Layout';
import Home from './Home';
import HeadlineStats from './HeadlineStats';
import AreaComparisonStats from './AreaComparisonStats';
import Search from './Search';
import Loo from './Loo';

export default function Explorer({ auth }) {
  let match = useRouteMatch();

  return (
    <Layout>
      <Switch>
        <Route exact path={`${match.path}/`}>
          <Home />
        </Route>
        <Route path={`${match.path}/loos/:id`}>
          <Loo />
        </Route>
        <Route path={`${match.path}/statistics`}>
          <HeadlineStats />
        </Route>
        <Route path={`${match.path}/areas`}>
          <AreaComparisonStats />
        </Route>
        <Route path={`${match.path}/search`}>
          <Search />
        </Route>
      </Switch>
    </Layout>
  );
}

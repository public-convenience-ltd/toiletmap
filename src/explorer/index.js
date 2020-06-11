import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import Layout from './Layout';
import Home from './Home';
import HeadlineStats from './HeadlineStats';
import Areas from './Areas';
import Search from './Search';
import Loo from './Loo';
import Voyager from './Voyager';

export default function Explorer() {
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
          <Areas />
        </Route>
        <Route path={`${match.path}/search`}>
          <Search />
        </Route>
        <Route path={`${match.path}/voyager`}>
          <Voyager />
        </Route>
      </Switch>
    </Layout>
  );
}

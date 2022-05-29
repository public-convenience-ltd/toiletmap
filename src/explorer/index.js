import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Layout from './Layout';
import Home from './Home';
import HeadlineStats from './HeadlineStats';
import Areas from './Areas';
import Search from './Search';
import Loo from './Loo';
import Voyager from './Voyager';
import Map from './Map';

export default function Explorer() {
  return (
    <Layout>
      <Switch>
        <Route exact path={`/`}>
          <Home />
        </Route>
        <Route exact path={`/loos/:id`}>
          <Loo />
        </Route>
        <Route exact path={`/statistics`}>
          <HeadlineStats />
        </Route>
        <Route exact path={`/areas`}>
          <Areas />
        </Route>
        <Route exact path={`/search`}>
          <Search />
        </Route>
        <Route exact path={`/voyager`}>
          <Voyager />
        </Route>
        <Route exact path={`/map`}>
          <Map />
        </Route>
      </Switch>
    </Layout>
  );
}

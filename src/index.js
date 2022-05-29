// Polyfills
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'resize-observer-polyfill';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { SWRConfig } from 'swr';

import PageLoading from './components/PageLoading';

import AuthProvider from './Auth';
import fetcher from './graphql/fetcher';
import { MapStateProvider } from './components/MapState';

import Explorer from './explorer/index';

if (process.env.REACT_APP_MOCKS) {
  require('./mocks');
}

const history = createBrowserHistory();

ReactDOM.render(
  <AuthProvider>
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <MapStateProvider>
        <Router history={history}>
          <Suspense fallback={<PageLoading />}>
            <Switch>
              <Explorer />
            </Switch>
          </Suspense>
        </Router>
      </MapStateProvider>
    </SWRConfig>
  </AuthProvider>,
  document.getElementById('root')
);

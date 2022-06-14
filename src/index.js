// Polyfills
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'resize-observer-polyfill';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { SWRConfig } from 'swr';

import AuthProvider from './Auth';
import fetcher from './graphql/fetcher';

import Explorer from './explorer/index';

const history = createBrowserHistory();

ReactDOM.render(
  <AuthProvider>
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <Router history={history}>
        <Suspense fallback={<h1>Loading</h1>}>
          <Switch>
            <Explorer />
          </Switch>
        </Suspense>
      </Router>
    </SWRConfig>
  </AuthProvider>,
  document.getElementById('root')
);

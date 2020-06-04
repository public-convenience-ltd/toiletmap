// Polyfills
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'resize-observer-polyfill';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ContributePage from './pages/ContributePage';
import MapPage from './pages/MapPage';
import UseOurLoosPage from './pages/UseOurLoosPage';
import CookiesPage from './pages/CookiesPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFound from './pages/404';
import Tracking from './components/Tracking';
import PageLoading from './components/PageLoading';

import AuthProvider from './Auth';
import ApolloProvider from './Apollo';
import { MapStateProvider } from './components/MapState';

const history = createBrowserHistory();

const Explorer = lazy(() =>
  import(/*webpackChunkName: 'explorer'*/ './explorer')
);
const AddPage = lazy(() =>
  import(/*webpackChunkName: 'add'*/ './pages/AddPage')
);
const EditPage = lazy(() =>
  import(/*webpackChunkName: 'edit'*/ './pages/EditPage')
);
const RemovePage = lazy(() =>
  import(/*webpackChunkName: 'remove'*/ './pages/RemovePage')
);

ReactDOM.render(
  <AuthProvider>
      <MapStateProvider>
    <ApolloProvider>
      <Router history={history}>
        <Tracking />
        <Suspense fallback={<PageLoading />}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <ProtectedRoute path="/loos/add" component={AddPage} />
            <Route path="/loos/:id" exact component={HomePage} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/cookies" component={CookiesPage} />
            <Route exact path="/privacy" component={PrivacyPage} />
            <Route exact path="/use-our-loos" component={UseOurLoosPage} />
            <Route exact path="/contact" component={ContactPage} />
            <Route
              path="/contribute"
              render={(props) => <ContributePage {...props} />}
            />
            <Router
              path="/login"
              render={() => <Redirect to="/contribute" />}
            />
            <Route
              path="/map/:lng/:lat"
              render={(props) => <MapPage {...props} />}
            />
            <Route
              exact
              path="/callback"
              render={(props) => <AuthCallback {...props} />}
            />
            <Route
              path="/explorer"
              render={(props) => <Explorer {...props} />}
            />
            <ProtectedRoute path="/loos/:id/edit" component={EditPage} />
            <ProtectedRoute path="/loos/:id/remove" component={RemovePage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    </ApolloProvider>
      </MapStateProvider>
  </AuthProvider>,
  document.getElementById('root')
);

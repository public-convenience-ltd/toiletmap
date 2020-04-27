// Polyfills
import 'core-js/features/array/find';
import 'core-js/features/array/includes';
import 'core-js/features/string/repeat';
import 'core-js/features/object/entries';
import 'core-js/features/object/assign';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

// Global CSS
import './css/global';

import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import LooPage from './pages/LooPage';
import RemovePage from './pages/RemovePage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddPage from './pages/AddPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import PreferencesPage from './pages/PreferencesPage';
import MapPage from './pages/MapPage';
import UseOurLoosPage from './pages/UseOurLoosPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFound from './pages/404';
import Tracking from './components/Tracking';

import history from './history';
import Router from './Router';
import AuthProvider from './Auth';
import App, { cache } from './App';

const Explorer = lazy(() => import('./explorer'));

ReactDOM.render(
  <AuthProvider>
    <App>
      <Router history={history} forceRefresh={false}>
        <Tracking />
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" render={(props) => <HomePage {...props} />} />
            <Route exact path="/preferences" component={PreferencesPage} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/privacy" component={PrivacyPage} />
            <Route exact path="/use-our-loos" component={UseOurLoosPage} />
            <Route path="/loos/:id" exact component={LooPage} />
            <Route path="/login" render={(props) => <LoginPage {...props} />} />
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
            <ProtectedRoute
              exact
              path="/report"
              injectProps={{ cache }}
              component={AddPage}
            />
            <ProtectedRoute
              path="/loos/:id/edit"
              injectProps={{ cache }}
              component={EditPage}
            />
            <ProtectedRoute path="/loos/:id/remove" component={RemovePage} />
            <ProtectedRoute path="/loos/:id/thanks" component={LooPage} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Router>
    </App>
  </AuthProvider>,
  document.getElementById('root')
);

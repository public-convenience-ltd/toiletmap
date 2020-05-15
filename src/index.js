// Polyfills
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import AuthCallback from './pages/AuthCallback';
import LooPage from './pages/LooPage';
import RemovePage from './pages/RemovePage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddPage from './pages/AddPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';
import MapPage from './pages/MapPage';
import UseOurLoosPage from './pages/UseOurLoosPage';
import CookiesPage from './pages/CookiesPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFound from './pages/404';
import Tracking from './components/Tracking';
import PageLoading from './components/PageLoading';

import history from './history';
import Router from './Router';
import AuthProvider from './Auth';
import App from './App';

const Explorer = lazy(() => import('./explorer'));

ReactDOM.render(
  <AuthProvider>
    <App>
      <Router history={history} forceRefresh={false}>
        <Tracking />
        <Suspense fallback={<PageLoading />}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/loos/:id" exact component={HomePage} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/cookies" component={CookiesPage} />
            <Route exact path="/privacy" component={PrivacyPage} />
            <Route exact path="/use-our-loos" component={UseOurLoosPage} />
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
            <ProtectedRoute exact path="/report" component={AddPage} />
            <ProtectedRoute path="/loos/:id/edit" component={EditPage} />
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

// Polyfills
import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';
import 'core-js/fn/string/repeat';
import 'core-js/fn/object/entries';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import Analytics from 'react-router-ga';

import config from './config';

import * as serviceWorker from './serviceWorker';

// Global CSS
import './css/global';

import App from './components/App';
import AuthCallback from './pages/AuthCallback';
import LooPage from './pages/LooPage';
import RemovePage from './pages/RemovePage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddEditPage from './pages/AddEditPage';
import LoginPage from './pages/LoginPage';
import PreferencesPage from './pages/PreferencesPage';
import ThanksPage from './pages/ThanksPage';
import MapPage from './pages/MapPage';
import UseOurLoosPage from './pages/UseOurLoosPage';
import PrivacyPage from './pages/PrivacyPage';

// Redux reducers
import appReducer from './redux/modules/app';
import geolocationReducer from './redux/modules/geolocation';
import loosReducer from './redux/modules/loos';
import mapControlsReducer from './redux/modules/mapControls';
import authReducer from './redux/modules/auth';

// Redux sagas
import geolocationSaga from './redux/sagas/geolocation';
import makeLoosSaga from './redux/sagas/loos';
import makeAuthSaga from './redux/sagas/auth';
import mapControlsSaga from './redux/sagas/mapControls';

import history from './history';
import Auth from './Auth';
const auth = new Auth();

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  geolocation: geolocationReducer,
  loos: loosReducer,
  mapControls: mapControlsReducer,
});

const sagaMiddleware = createSagaMiddleware();

const middleware = applyMiddleware(sagaMiddleware);

const devTools = window.devToolsExtension && window.devToolsExtension();

const initialState = {};

const store = middleware(createStore)(rootReducer, initialState, devTools);

// Run sagas
sagaMiddleware.run(makeAuthSaga(auth));
sagaMiddleware.run(geolocationSaga);
sagaMiddleware.run(makeLoosSaga(auth));
sagaMiddleware.run(mapControlsSaga);

// Create an enhanced history that syncs navigation events with the store

if (typeof document !== 'undefined') {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history} forceRefresh={false}>
        <Analytics id={config.analyticsId}>
          <App>
            <Route exact path="/" component={HomePage} />
            <Route exact path="/preferences" component={PreferencesPage} />
            <Route exact path="/about" component={AboutPage} />
            <Route exact path="/privacy" component={PrivacyPage} />
            <Route exact path="/use-our-loos" component={UseOurLoosPage} />
            <Route path="/loos/:id" exact component={LooPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/map/:lng/:lat" component={MapPage} />
            <Route
              exact
              path="/callback"
              render={props => <AuthCallback auth={auth} {...props} />}
            />
            <Route exact path="/report" component={AddEditPage} />
            <Route path="/loos/:id/edit" component={AddEditPage} />
            <Route path="/loos/:id/remove" component={RemovePage} />
            <Route path="/loos/:id/thanks" component={ThanksPage} />
          </App>
        </Analytics>
      </Router>
    </Provider>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

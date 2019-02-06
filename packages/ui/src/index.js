// Polyfills
import 'core-js/fn/array/find';
import 'core-js/fn/array/includes';
import 'core-js/fn/string/repeat';
import 'core-js/fn/object/entries';

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, LocationProvider } from '@reach/router';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import * as serviceWorker from './serviceWorker';
import history from './history';

import 'leaflet/dist/leaflet.css';
import '@toiletmap/leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-loading/src/Control.Loading.css';
import '@toiletmap/design-system/es/global';

import App from './App';
import ProtectedRoute from './ProtectedRoute';
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

import Auth from './Auth';

import styles from './App/App.module.css';

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

const devTools =
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const initialState = {};

const store = middleware(createStore)(rootReducer, initialState, devTools);

history.listen(() => {
  window.ga('send', 'pageview');
});

// Run sagas
sagaMiddleware.run(makeAuthSaga(auth));
sagaMiddleware.run(geolocationSaga);
sagaMiddleware.run(makeLoosSaga(auth));
sagaMiddleware.run(mapControlsSaga);

if (typeof document !== 'undefined') {
  ReactDOM.render(
    <Provider store={store}>
      <LocationProvider history={history}>
        <Router className={styles.appContainer}>
          <App path="/">
            <HomePage default />
            <AboutPage path="about" />
            <PreferencesPage path="preferences" />
            <PrivacyPage path="privacy" />
            <UseOurLoosPage path="use-our-loos" />
            <LooPage path="loos/:id" />
            <LoginPage path="login" />
            <MapPage path="map/:lng/:lat" />
            <AuthCallback path="callback" auth={auth} />
            <ProtectedRoute path="report" auth={auth}>
              <AddEditPage default />
            </ProtectedRoute>
            <ProtectedRoute path="loos/:id" auth={auth}>
              <AddEditPage path="edit" />
              <RemovePage path="remove" />
              <ThanksPage path="thanks" />
            </ProtectedRoute>
          </App>
        </Router>
      </LocationProvider>
    </Provider>,
    document.getElementById('root')
  );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route } from 'react-router-dom';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import registerServiceWorker from './registerServiceWorker';

// Global CSS
import './css/global';

import App from './components/App';
import PageLayout from './components/PageLayout';

import NearestLooMap from './components/map/NearestLooMap';
import SingleLooMap from './components/map/SingleLooMap';
import AddEditLooMap from './components/map/AddEditLooMap';

import AuthCallback from './pages/AuthCallback';
import LooPage from './pages/LooPage';
import RemovePage from './pages/RemovePage';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AddEditPage from './pages/AddEditPage';
import LoginPage from './pages/LoginPage';
import PreferencesPage from './pages/PreferencesPage';

import SingleLooProvider from './components/SingleLooProvider';

// Redux reducers
import appReducer from './redux/modules/app';
import geolocationReducer from './redux/modules/geolocation';
import loosReducer from './redux/modules/loos';
import looMapNearestReducer from './redux/modules/loo-map-nearest';
import looMapAddEditReducer from './redux/modules/loo-map-add-edit';
import authReducer from './redux/modules/auth';

// Redux sagas
import geolocationSaga from './redux/sagas/geolocation';
import makeLoosSaga from './redux/sagas/loos';
import makeAuthSaga from './redux/sagas/auth';

import history from './history';
import Auth from './Auth';
const auth = new Auth();

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  geolocation: geolocationReducer,
  loos: loosReducer,
  mapNearest: looMapNearestReducer,
  mapAddEdit: looMapAddEditReducer,
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

// Create an enhanced history that syncs navigation events with the store

if (typeof document !== 'undefined') {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history} forceRefresh={false}>
        <App>
          <Route
            exact
            path="/"
            render={() => {
              return <PageLayout main={<HomePage />} map={<NearestLooMap />} />;
            }}
          />
          <Route
            exact
            path="/preferences"
            render={() => {
              return (
                <PageLayout
                  main={<PreferencesPage />}
                  map={<NearestLooMap />}
                />
              );
            }}
          />
          <Route
            exact
            path="/about"
            render={() => {
              return (
                <PageLayout main={<AboutPage />} map={<NearestLooMap />} />
              );
            }}
          />
          <Route
            path="/loos/:id"
            exact
            render={({ match }) => {
              return (
                <SingleLooProvider params={match.params}>
                  <PageLayout main={<LooPage />} map={<SingleLooMap />} />
                </SingleLooProvider>
              );
            }}
          />
          <Route
            path="/login"
            render={() => {
              return (
                <PageLayout main={<LoginPage />} map={<NearestLooMap />} />
              );
            }}
          />
          <Route
            exact
            path="/callback"
            render={props => <AuthCallback auth={auth} {...props} />}
          />
          <Route
            exact
            path="/report"
            render={() => {
              return (
                <PageLayout main={<AddEditPage />} map={<AddEditLooMap />} />
              );
            }}
          />
          <Route
            path="/loos/:id/edit"
            render={({ match }) => {
              return (
                <SingleLooProvider params={match.params}>
                  <PageLayout main={<AddEditPage />} map={<AddEditLooMap />} />
                </SingleLooProvider>
              );
            }}
          />
          <Route
            path="/loos/:id/remove"
            render={({ match }) => {
              return (
                <SingleLooProvider params={match.params}>
                  <PageLayout main={<RemovePage />} map={<SingleLooMap />} />
                </SingleLooProvider>
              );
            }}
          />
        </App>
      </Router>
    </Provider>,
    document.getElementById('root')
  );
}
registerServiceWorker();

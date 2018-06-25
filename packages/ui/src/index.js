import React from 'react';
import ReactDOM from 'react-dom';
import {
  Router,
  IndexRoute,
  Route,
  Redirect,
  hashHistory,
  browserHistory,
} from 'react-router';
import {
  syncHistoryWithStore,
  routerMiddleware,
  routerReducer,
} from 'react-router-redux';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import registerServiceWorker from './registerServiceWorker';
import config from './config';

// Global CSS
import './css/global';

import App from './components/App';
import PageLayout from './components/PageLayout';

import NearestLooMap from './components/map/NearestLooMap';
import SingleLooMap from './components/map/SingleLooMap';
import AddEditLooMap from './components/map/AddEditLooMap';

import LooPage from './components/page/LooPage';
import RemovePage from './components/page/RemovePage';
import HomePage from './components/page/HomePage';
import AboutPage from './components/page/AboutPage';
import AddEditPage from './components/page/AddEditPage';
import SignInPage from './components/page/SignInPage';
import PreferencesPage from './components/page/PreferencesPage';

import SingleLooProvider from './components/SingleLooProvider';

// Redux reducers
import appReducer from './redux/modules/app';
import authReducer from './redux/modules/auth';
import geolocationReducer from './redux/modules/geolocation';
import loosReducer from './redux/modules/loos';
import looMapNearestReducer from './redux/modules/loo-map-nearest';
import looMapAddEditReducer from './redux/modules/loo-map-add-edit';

// Redux sagas
import geolocationSaga from './redux/sagas/geolocation';
import loosSaga from './redux/sagas/loos';
import authSaga from './redux/sagas/auth';

var rootReducer = combineReducers({
  routing: routerReducer,
  app: appReducer,
  auth: authReducer,
  geolocation: geolocationReducer,
  loos: loosReducer,
  mapNearest: looMapNearestReducer,
  mapAddEdit: looMapAddEditReducer,
});

var sagaMiddleware = createSagaMiddleware();

var historyType = window.cordova ? hashHistory : browserHistory;

const routingMiddleware = routerMiddleware(historyType);

var middleware = applyMiddleware(sagaMiddleware, routingMiddleware);

var devTools = window.devToolsExtension && window.devToolsExtension();

var initialState = {};

var store = middleware(createStore)(rootReducer, initialState, devTools);

// Run sagas
sagaMiddleware.run(geolocationSaga);
sagaMiddleware.run(loosSaga);
sagaMiddleware.run(authSaga);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(historyType, store);

if (typeof document !== 'undefined') {
  ReactDOM.render(
    <Provider store={store}>
      <Router history={history}>
        <Route component={App}>
          <Route path="/" component={PageLayout}>
            <IndexRoute components={{ main: HomePage, map: NearestLooMap }} />
            <Route
              path="preferences"
              components={{ main: PreferencesPage, map: NearestLooMap }}
            />
            <Route
              path="about"
              components={{ main: AboutPage, map: NearestLooMap }}
            />
            <Route
              path="signin"
              components={{ main: SignInPage, map: NearestLooMap }}
            />
            <Route
              path="report"
              components={{ main: AddEditPage, map: AddEditLooMap }}
            />
          </Route>
          <Route path="loos/:id" component={SingleLooProvider}>
            <Route component={PageLayout}>
              <IndexRoute components={{ main: LooPage, map: SingleLooMap }} />
              {config.allowAddEditLoo && (
                <Route
                  path="edit"
                  components={{ main: AddEditPage, map: AddEditLooMap }}
                />
              )}
              {config.allowAddEditLoo && (
                <Route
                  path="remove"
                  components={{ main: RemovePage, map: SingleLooMap }}
                />
              )}
            </Route>
          </Route>
        </Route>
        <Redirect from="*" to="/" />
      </Router>
    </Provider>,
    document.getElementById('root')
  );
}
registerServiceWorker();

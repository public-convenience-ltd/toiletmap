import { all, takeLatest, call, put } from 'redux-saga/effects';
import { push as navigate } from 'react-router-redux';

import {
  AUTH_REQUEST,
  GET_STATUS_REQUEST,
  GET_STATUS_SUCCESS,
  SIGNOUT_REQUEST,
  SIGNOUT_SUCCESS,
  actions,
} from '../modules/auth';

import config from '../../config';
import api from '../../api';

function* authenticate(action) {
  var service = action.payload.service;
  var url = `${config.apiEndpoint}/auth/${service}?redirect=`;

  var cordovaLogin = function() {
    return new Promise((resolve, reject) => {
      if (window.cordova) {
        window.open = window.cordova.InAppBrowser.open;

        // ?redirect
        url += '/inappsuccess';

        // Store a reference to the InAppBrowser window so we can close it later
        var ref = window.open(
          url,
          '_blank',
          'clearcache=no,clearsessioncache=no,toolbar=yes,location=yes,hardwareback=no'
        );

        // Reverts the call back to it's prototype's default
        delete window.open;

        ref.addEventListener('loadstop', function(evt) {
          // Wait to reach the redirect url
          if (evt.url.indexOf('inappsuccess') !== -1) {
            // Close the InAppBrowser
            ref.close();

            ref.addEventListener('exit', resolve);
          }
        });
      } else {
        console.log('Not in a Cordova environment.');
      }
    });
  };

  if (window.cordova) {
    yield call(cordovaLogin, service);
    yield put(navigate('/'));
    yield put(actions[GET_STATUS_REQUEST]());
  } else {
    // ?redirect
    var redirect = `${window.location.protocol}//${window.location.host}`;

    window.location = url + redirect;
  }
}

function* getStatus() {
  var authenticated = yield call(api.isAuthenticated);
  yield put(actions[GET_STATUS_SUCCESS](authenticated));
}

function* signout() {
  yield call(api.signout);
  yield put(actions[SIGNOUT_SUCCESS]());
}

export default function* geolocationSaga() {
  yield all([
    takeLatest(AUTH_REQUEST, authenticate),
    takeLatest(GET_STATUS_REQUEST, getStatus),
    takeLatest(SIGNOUT_REQUEST, signout),
  ]);
}

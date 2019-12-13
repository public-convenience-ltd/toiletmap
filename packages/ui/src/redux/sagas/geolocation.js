import { takeLatest, call, put } from 'redux-saga/effects';

import {
  GET_GEOLOCATION_REQUEST,
  GET_GEOLOCATION_ERROR,
  GET_GEOLOCATION_SUCCESS,
  actions,
} from '../modules/geolocation';

import { actionUpdateCenter } from '../modules/mapControls';
import config from '../../config';

function* findGeolocation() {
  function getGeolocation() {
    return new Promise((resolve, reject) => {
      // We need a timeout here for android https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/#android-quirks
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
      });
    });
  }

  if ('geolocation' in navigator) {
    try {
      var response = yield call(getGeolocation);
      yield put(actions[GET_GEOLOCATION_SUCCESS](response));
      var { longitude, latitude } = response.coords;
      yield put(actionUpdateCenter({ lng: longitude, lat: latitude }));
    } catch (error) {
      yield put(actions[GET_GEOLOCATION_ERROR](error.message));
      yield put(actionUpdateCenter(config.fallbackLocation));
    }
  } else {
    yield put(actions[GET_GEOLOCATION_ERROR]('Geolocation is unavailable'));
    yield put(actionUpdateCenter(config.fallbackLocation));
  }
}

export default function* geolocationSaga() {
  yield takeLatest(GET_GEOLOCATION_REQUEST, findGeolocation);
}

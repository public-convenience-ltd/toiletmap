import { takeLatest, call, put } from 'redux-saga/effects';

import {
  GET_GEOLOCATION_REQUEST,
  GET_GEOLOCATION_ERROR,
  GET_GEOLOCATION_SUCCESS,
  actions,
} from '../modules/geolocation';

function* findGeolocation() {
  function getGeolocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  if ('geolocation' in navigator) {
    try {
      var response = yield call(getGeolocation);
      yield put(actions[GET_GEOLOCATION_SUCCESS](response));
    } catch (error) {
      yield put(actions[GET_GEOLOCATION_ERROR](error.message));
    }
  } else {
    yield put(actions[GET_GEOLOCATION_ERROR]('Geolocation is unavailable'));
  }
}

export default function* geolocationSaga() {
  yield takeLatest(GET_GEOLOCATION_REQUEST, findGeolocation);
}

import { all, takeLatest, call, put } from 'redux-saga/effects';
import { push as navigate } from 'react-router-redux';

import api from '../../api';
import { PENDING_REPORT_KEY } from '../../config';

import {
  FIND_NEARBY_REQUEST,
  FIND_NEARBY_SUCCESS,
  FIND_BY_ID_REQUEST,
  FIND_BY_ID_SUCCESS,
  REPORT_REQUEST,
  REPORT_SUCCESS,
  REPORT_PROCESS_PENDING,
  actions,
} from '../modules/loos';

function* findNearbyLoosSaga(action) {
  var { lng, lat, radius } = action.payload;
  var loos = yield call(api.findLoos, lng, lat, radius);
  yield put(actions[FIND_NEARBY_SUCCESS](loos));
}

function* findLooByIdSaga(action) {
  var loo = yield call(api.findLooById, action.payload.id);
  yield put(actions[FIND_BY_ID_SUCCESS](loo));
}

function* report(loo) {
  // Re-direct the user to the authentication screen, if they're not
  // already logged in
  var authenticated = yield api.isAuthenticated();

  if (!authenticated) {
    yield put(navigate('/signin'));
  } else {
    // Todo: Catch HTTP 401 and navigate to '/signin'
    yield call(api.reportLoo, loo);
    yield put(actions[REPORT_SUCCESS](loo));
  }
}

function* reportRequest(action) {
  var loo = action.payload.loo;

  // Store loo in localStorage so, if neccessary, we can perform
  // authentication and pick it up again once we've been re-directed
  // back to our application
  localStorage.setItem(PENDING_REPORT_KEY, JSON.stringify(loo));

  yield call(report, loo);
}

function* processPending() {
  var loo = JSON.parse(localStorage.getItem(PENDING_REPORT_KEY));
  var authenticated = yield api.isAuthenticated();

  if (loo && authenticated) {
    yield call(api.reportLoo, loo);
    yield put(actions[REPORT_SUCCESS](loo));

    // Remove pending loo report
    localStorage.removeItem(PENDING_REPORT_KEY);
  }
}

export default function* loosSaga() {
  yield all([
    takeLatest(FIND_NEARBY_REQUEST, findNearbyLoosSaga),
    takeLatest(FIND_BY_ID_REQUEST, findLooByIdSaga),
    takeLatest(REPORT_REQUEST, reportRequest),
    takeLatest(REPORT_PROCESS_PENDING, processPending),
  ]);
}

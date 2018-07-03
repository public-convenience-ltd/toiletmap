import { all, takeLatest, call, put } from 'redux-saga/effects';
import history from '../../history';

import api from '../../api';
import { PENDING_REPORT_KEY, PENDING_REMOVE_KEY } from '../../config';

import {
  FIND_NEARBY_REQUEST,
  FIND_BY_ID_REQUEST,
  REPORT_REQUEST,
  REMOVE_REQUEST,
  actionFindNearbySuccess,
  actionFindByIdSuccess,
  actionReportSuccess,
  actionRemoveSuccess,
} from '../modules/loos';

import { LOGGED_IN } from '../modules/auth';

export default function makeLoosSaga(auth) {
  function* findNearbyLoosSaga(action) {
    var { lng, lat, radius } = action.payload;
    var loos = yield call(api.findLoos, lng, lat, radius);
    yield put(actionFindNearbySuccess(loos));
  }
  function* findLooByIdSaga(action) {
    var loo = yield call(api.findLooById, action.payload.id);
    yield put(actionFindByIdSuccess(loo));
  }

  function* report(loo) {
    // Todo: Catch HTTP 401 and navigate to '/login'
    const ids = yield call(api.reportLoo, loo, auth.getAccessToken());
    // maybe we should navigate as a result of the success action
    yield put(actionReportSuccess(ids));
    return yield call(history.push, `/loos/${ids.loo}`);
  }

  function* reportRequest(action) {
    // TODO: when a report has an existing loo dispatch `actionUncacheById`
    const loo = action.payload.loo;
    // Re-direct the user to the authentication screen, if they're not
    // already logged in
    if (!auth.isAuthenticated()) {
      // Store loo in localStorage so, if neccessary, we can perform
      // authentication and pick it up again once we've been re-directed
      // back to our application
      localStorage.setItem(PENDING_REPORT_KEY, JSON.stringify(loo));
      return yield call(history.push, '/login');
    }
    yield call(report, loo);
  }

  function* remove(id, reason) {
    // Todo: Catch HTTP 401 and navigate to '/login'
    const result = yield call(api.removeLoo, id, reason, auth.getAccessToken());
    // maybe we should navigate as a result of the success action
    yield put(actionRemoveSuccess(result));
    return yield call(history.push, `/`);
  }

  function* removeRequest(action) {
    const { looId, reason } = action.payload;
    // Re-direct the user to the authentication screen, if they're not
    // already logged in
    if (!auth.isAuthenticated()) {
      // Store loo in localStorage so, if neccessary, we can perform
      // authentication and pick it up again once we've been re-directed
      // back to our application
      localStorage.setItem(PENDING_REMOVE_KEY, JSON.stringify(action.payload));
      return yield call(history.push, '/login');
    }
    yield call(remove, looId, reason);
  }

  /**
   * Called on login to pick up any pending reports
   */
  function* processPending() {
    const loo = JSON.parse(localStorage.getItem(PENDING_REPORT_KEY));
    if (loo) {
      localStorage.removeItem(PENDING_REPORT_KEY);
      yield call(report, loo);
    }
    const remove = JSON.parse(localStorage.getItem(PENDING_REMOVE_KEY));
    if (remove) {
      localStorage.removeItem(PENDING_REMOVE_KEY);
      yield call(report, loo);
    }
  }

  return function* loosSaga() {
    yield all([
      takeLatest(FIND_NEARBY_REQUEST, findNearbyLoosSaga),
      takeLatest(FIND_BY_ID_REQUEST, findLooByIdSaga),
      takeLatest(REPORT_REQUEST, reportRequest),
      takeLatest(REMOVE_REQUEST, removeRequest),
      takeLatest(LOGGED_IN, processPending),
    ]);
  };
}

import { all, takeLatest, call, put, select, take } from 'redux-saga/effects';

import api from '@toiletmap/api-client';

import {
  FIND_NEARBY_REQUEST,
  FIND_NEARBY_SUCCESS,
  FIND_BY_ID_REQUEST,
  REPORT_REQUEST,
  REMOVE_REQUEST,
  actionFindNearbyRequest,
  actionFindNearbyStart,
  actionFindNearbySuccess,
  actionFindByIdSuccess,
  actionReportSuccess,
  actionRemoveSuccess,
  actionUncacheById,
} from '../modules/loos';

import { getCenter } from './mapControls';

export default function makeLoosSaga(auth) {
  function* findNearbyLoosSaga(action) {
    yield put(actionFindNearbyStart());
    var { lng, lat, radius } = action.payload;
    var loos = yield call([api, api.findLoos], lng, lat, radius);
    yield put(actionFindNearbySuccess(loos));
  }
  function* findLooByIdSaga(action) {
    var loo = yield call([api, api.findLooById], action.payload.id);
    yield put(actionFindByIdSuccess(loo));
  }

  function* report(action) {
    const { loo, from } = action.payload;

    const ids = yield call(
      [api, api.reportLoo],
      loo,
      auth.getAccessToken(),
      from
    );

    yield put(actionReportSuccess(ids));
    yield put(actionUncacheById(ids.loo));
    let center = yield select(getCenter);
    yield put(actionFindNearbyRequest(center.lng, center.lat));
    yield take(FIND_NEARBY_SUCCESS);
    return yield call(() => (window.location = `/loos/${ids.loo}/thanks`));
  }

  function* remove(action) {
    const { looId, reason } = action.payload;
    const result = yield call(
      [api, api.removeLoo],
      looId,
      reason,
      auth.getAccessToken()
    );
    yield put(actionRemoveSuccess(result));
    return yield call(() => (window.location = `/`));
  }

  return function* loosSaga() {
    yield all([
      takeLatest(FIND_NEARBY_REQUEST, findNearbyLoosSaga),
      takeLatest(FIND_BY_ID_REQUEST, findLooByIdSaga),
      takeLatest(REPORT_REQUEST, report),
      takeLatest(REMOVE_REQUEST, remove),
    ]);
  };
}

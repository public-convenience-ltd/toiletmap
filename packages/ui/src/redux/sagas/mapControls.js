import _ from 'lodash';
import { takeLatest, select, put } from 'redux-saga/effects';

import {
  UPDATE_CENTER,
  actionUpdateCenterFinish,
} from '../modules/mapControls';
import { actionFindNearbyRequest } from '../modules/loos';

import config from '../../config';

export const getCenter = state => state.mapControls.center;

function* updateCenterSaga(action) {
  const oldCenter = yield select(getCenter);
  const newCenter = action.payload.center;

  // Get nearby loos if we've moved
  if (!_.isEqual(oldCenter, newCenter)) {
    yield put(
      actionFindNearbyRequest(
        newCenter.lng,
        newCenter.lat,
        config.nearestRadius
      )
    );
  }

  // Change the actual center variable in the state
  yield put(actionUpdateCenterFinish(newCenter));
}

export default function* mapControlsSaga() {
  yield takeLatest(UPDATE_CENTER, updateCenterSaga);
}

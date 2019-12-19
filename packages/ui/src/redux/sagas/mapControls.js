import _ from 'lodash';
import { takeLatest, select, put } from 'redux-saga/effects';

import {
  UPDATE_CENTER,
  actionUpdateCenterFinish,
} from '../modules/mapControls';
import { actionFindNearbyRequest } from '../modules/loos';
import config from '../../config';

export const getCenter = state => state.mapControls.center;
// get view mode from the app
const getViewMode = state => state.map.viewMode;

function* updateCenterSaga(action) {
  const oldCenter = yield select(getCenter);
  const viewMode = yield select(getViewMode);
  const newCenter = action.payload.center;
  const newRadius = action.payload.radius;

  // Get nearby loos if we've moved
  if (!_.isEqual(oldCenter, newCenter)) {
    yield put(
      actionFindNearbyRequest(
        newCenter.lng,
        newCenter.lat,
        // unconformable
        viewMode === 'map' ? newRadius : config.nearestRadius
      )
    );
  }

  // Change the actual center variable in the state
  yield put(actionUpdateCenterFinish(newCenter));
}

export default function* mapControlsSaga() {
  yield takeLatest(UPDATE_CENTER, updateCenterSaga);
}

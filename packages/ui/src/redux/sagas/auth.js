import { all, takeLatest, call, put } from 'redux-saga/effects';
import history from '../../history';

import { LOGIN, LOGOUT, actionLoggedIn, actionSetName } from '../modules/auth';

export default function makeAuthSaga(auth) {
  function* doLogin() {
    if (!window.cordova) {
      yield call(auth.webLogin);
      return;
    }

    yield call(auth.nativeLogin);

    // flow copied from AuthCallback page
    if (auth.isAuthenticated()) {
      // dispatch a login action
      yield put(actionLoggedIn(true));
      yield put(actionSetName(auth.getProfile().name));

      yield call(history.push, auth.redirectOnLogin() || '/');
    }
  }

  function* doLogout() {
    yield call(auth.logout);
    yield put(actionLoggedIn(false));
    yield call(history.push, '/');
  }

  return function* authSaga() {
    yield all([takeLatest(LOGIN, doLogin), takeLatest(LOGOUT, doLogout)]);
  };
}

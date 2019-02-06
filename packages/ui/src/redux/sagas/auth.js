import { all, takeLatest, call, put } from 'redux-saga/effects';

import { LOGIN, LOGOUT, actionLoggedIn } from '../modules/auth';

export default function makeAuthSaga(auth) {
  function* doLogin() {
    yield call(auth.login);
  }

  function* doLogout() {
    yield call(auth.logout);
    yield put(actionLoggedIn(false));
    yield call(() => (window.location = '/'));
  }

  return function* authSaga() {
    yield all([takeLatest(LOGIN, doLogin), takeLatest(LOGOUT, doLogout)]);
  };
}

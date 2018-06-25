import { all, takeLatest, call, put } from 'redux-saga/effects';
import history from '../../history';

import { LOGIN, LOGOUT, LOGGED_IN, actions } from '../modules/auth';

export default function makeAuthSaga(auth) {
  function* doLogin(action) {
    yield call(auth.login);
  }

  function* doLogout(action) {
    yield call(auth.logout);
    yield put(actions[LOGGED_IN](false));
    yield call(history.push, '/');
  }

  return function* authSaga() {
    yield all([
      //takeLatest(, checkAuth),
      takeLatest(LOGIN, doLogin),
      takeLatest(LOGOUT, doLogout),
    ]);
  };
}

import Auth from '../../Auth';

export const LOGIN = 'AUTH/DO/LOGIN';
export const LOGOUT = 'AUTH/DO/LOGOUT';
export const LOGGED_IN = 'AUTH/LOGIN/OK';
export const SET_NAME = 'AUTH/SET/NAME';

export const actionLogin = () => ({
  type: LOGIN,
});

export const actionLogout = () => ({
  type: LOGOUT,
});

export const actionLoggedIn = status => ({
  type: LOGGED_IN,
  payload: status,
});

export const actionSetName = name => ({
  type: SET_NAME,
  payload: name,
});

const HANDLERS = {
  [LOGGED_IN]: (state, action) => ({
    ...state,
    isAuthenticated: action.payload,
  }),
  [SET_NAME]: (state, action) => ({
    ...state,
    name: action.payload,
  }),
};

const initialState = {
  isAuthenticated: new Auth().isAuthenticated(),
  name: new Auth().getProfile().name,
};

export default function authReducer(state = initialState, action) {
  const handler = HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

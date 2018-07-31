import Auth from '../../Auth';

export const LOGIN = 'AUTH/DO/LOGIN';
export const LOGOUT = 'AUTH/DO/LOGOUT';
export const LOGGED_IN = 'AUTH/LOGIN/OK';

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

const HANDLERS = {
  [LOGGED_IN]: (state, action) => ({
    ...state,
    isAuthenticated: action.payload,
  }),
};

const initialState = {
  isAuthenticated: new Auth().isAuthenticated(),
};

export default function authReducer(state = initialState, action) {
  const handler = HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

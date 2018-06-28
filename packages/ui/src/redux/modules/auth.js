import Auth from '../../Auth';

export const LOGIN = 'AUTH/DO/LOGIN';
export const LOGOUT = 'AUTH/DO/LOGOUT';
export const LOGGED_IN = 'AUTH/LOGIN/OK';

export const login = () => ({
  type: LOGIN,
});

export const logout = () => ({
  type: LOGOUT,
});

export const loggedIn = status => ({
  type: LOGGED_IN,
  payload: status,
});

export const actions = {
  [LOGIN]: login,
  [LOGOUT]: logout,
  [LOGGED_IN]: loggedIn,
};

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

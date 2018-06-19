export const AUTH_REQUEST = 'AUTH/REQUEST';
export const GET_STATUS_REQUEST = 'AUTH/GET_STATUS/REQUEST';
export const GET_STATUS_SUCCESS = 'AUTH/GET_STATUS/SUCCESS';
export const SIGNOUT_REQUEST = 'AUTH/SIGNOUT/REQUEST';
export const SIGNOUT_SUCCESS = 'AUTH/SIGNOUT/SUCCESS';

// Actions

export const actionAuthRequest = service => ({
  type: AUTH_REQUEST,
  payload: {
    // 'facebook'|'twitter'|'openstreetmap'|'github'
    service,
  },
});

export const actionGetStatusRequest = () => ({
  type: GET_STATUS_REQUEST,
});

export const actionGetStatusSuccess = authenticated => ({
  type: GET_STATUS_SUCCESS,
  payload: {
    authenticated,
  },
});

export const actionSignoutRequest = () => ({
  type: SIGNOUT_REQUEST,
});

export const actionSignoutSuccess = () => ({
  type: SIGNOUT_SUCCESS,
});

export const actions = {
  [AUTH_REQUEST]: actionAuthRequest,
  [GET_STATUS_REQUEST]: actionGetStatusRequest,
  [GET_STATUS_SUCCESS]: actionGetStatusSuccess,
  [SIGNOUT_REQUEST]: actionSignoutRequest,
  [SIGNOUT_SUCCESS]: actionGetStatusSuccess,
};

// Action Handlers

const ACTION_HANDLERS = {
  [AUTH_REQUEST]: function(state, action) {
    return Object.assign({}, state, {
      service: action.payload.service,
    });
  },

  [GET_STATUS_SUCCESS]: function(state, action) {
    return Object.assign({}, state, {
      authenticated: action.payload.authenticated,
    });
  },

  [SIGNOUT_SUCCESS]: function(state, action) {
    return Object.assign({}, state, {
      authenticated: false,
    });
  },
};

// Reducer

var initialState = {
  authenticated: false,
};

export default function authReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

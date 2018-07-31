export const GET_GEOLOCATION_REQUEST = 'GEOLOCATION/GET_GEOLOCATION/REQUEST';
export const GET_GEOLOCATION_SUCCESS = 'GEOLOCATION/GET_GEOLOCATION/SUCCESS';
export const GET_GEOLOCATION_ERROR = 'GEOLOCATION/GET_GEOLOCATION/ERROR';

// Actions

export const actionGetGeolocationRequest = () => ({
  type: GET_GEOLOCATION_REQUEST,
});

export const actionGetGeolocationSuccess = position => ({
  type: GET_GEOLOCATION_SUCCESS,
  payload: {
    position,
  },
});

export const actionGetGeolocationError = error => ({
  type: GET_GEOLOCATION_ERROR,
  payload: {
    error,
  },
});

export const actions = {
  [GET_GEOLOCATION_REQUEST]: actionGetGeolocationRequest,
  [GET_GEOLOCATION_SUCCESS]: actionGetGeolocationSuccess,
  [GET_GEOLOCATION_ERROR]: actionGetGeolocationError,
};

// Action Handlers

const ACTION_HANDLERS = {
  [GET_GEOLOCATION_SUCCESS]: function(state, action) {
    var { longitude, latitude } = action.payload.position.coords;

    return {
      ...state,
      position: {
        lng: longitude,
        lat: latitude,
      },
    };
  },

  [GET_GEOLOCATION_ERROR]: function(state, action) {
    return {
      ...state,
      error: action.payload.error,
    };
  },
};

// Reducer

export default function geolocationReducer(state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

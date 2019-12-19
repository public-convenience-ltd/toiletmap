import config from '../../config';

export const ZOOM = 'MAP_CONTROLS/ZOOM';
export const UPDATE_CENTER = 'MAP_CONTROLS/UPDATE_CENTER';
export const UPDATE_CENTER_FINISH = 'MAP_CONTROLS/UPDATE_CENTER_FINISH';
export const HIGHLIGHT = 'MAP_CONTROLS/HIGHLIGHT';

// Actions

export const actionZoom = zoom => ({
  type: ZOOM,
  payload: {
    zoom,
  },
});

export const actionUpdateCenter = ({ lat, lng, radius }) => ({
  type: UPDATE_CENTER,
  payload: {
    center: { lat, lng },
    radius,
  },
});

export const actionUpdateCenterFinish = ({ lat, lng, radius }) => ({
  type: UPDATE_CENTER_FINISH,
  payload: {
    center: { lat, lng },
    radius,
  },
});

export const actionHighlight = id => ({
  type: HIGHLIGHT,
  payload: id,
});

// Action Handlers

const ACTION_HANDLERS = {
  [ZOOM]: function(state, action) {
    return {
      ...state,
      zoom: action.payload.zoom,
    };
  },

  [UPDATE_CENTER_FINISH]: function(state, action) {
    return {
      ...state,
      center: action.payload.center,
      radius: action.payload.radius,
    };
  },

  [HIGHLIGHT]: function(state, action) {
    return {
      ...state,
      highlight: action.payload,
    };
  },
};

const initialState = {
  radius: config.nearestRadius,
  zoom: config.initialZoom,
  center: config.fallbackLocation,
};

export default function mapControlsReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

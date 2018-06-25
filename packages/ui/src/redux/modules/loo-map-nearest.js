export const ZOOM = 'LOO_MAP_NEAREST/ZOOM';
export const UPDATE_CENTER = 'LOO_MAP_NEAREST/UPDATE_CENTER';
export const HIGHLIGHT = 'LOO_MAP_NEAREST/HIGHLIGHT';

// Actions

export const actionZoom = zoom => ({
  type: ZOOM,
  payload: {
    zoom,
  },
});

export const actionUpdateCenter = center => ({
  type: UPDATE_CENTER,
  payload: {
    // { lat, lng }
    center,
  },
});

export const actionHighlight = loo => ({
  type: HIGHLIGHT,
  payload: {
    loo,
  },
});

// Action Handlers

const ACTION_HANDLERS = {
  [ZOOM]: function(state, action) {
    return {
      ...state,
      zoom: action.payload.zoom,
    };
  },

  [UPDATE_CENTER]: function(state, action) {
    return {
      ...state,
      center: action.payload.center,
    };
  },

  [HIGHLIGHT]: function(state, action) {
    return {
      ...state,
      highlight: action.payload.loo,
    };
  },
};

// Reducer

export default function looMapNearestReducer(state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

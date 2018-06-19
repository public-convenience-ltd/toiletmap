export const NAVIGATE = 'APP/NAVIGATE/REQUEST';
export const TOGGLE_VIEW_MODE = 'APP/TOGGLE_VIEW_MODE/REQUEST';

// Actions

export const actionNavigate = () => ({
  type: NAVIGATE,
});

export const actionToggleViewMode = () => ({
  type: TOGGLE_VIEW_MODE,
});

export const actions = {
  [NAVIGATE]: actionNavigate,
  [TOGGLE_VIEW_MODE]: actionToggleViewMode,
};

// Action Handlers

const ACTION_HANDLERS = {
  [NAVIGATE]: function(state, action) {
    return Object.assign({}, state, {
      canGoBack: true,
    });
  },

  [TOGGLE_VIEW_MODE]: function(state, action) {
    return Object.assign({}, state, {
      viewMode: state.viewMode === 'map' ? 'list' : 'map',
    });
  },
};

// Reducer

const initialState = {
  canGoBack: false,
  viewMode: 'map',
};

export default function geolocationReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

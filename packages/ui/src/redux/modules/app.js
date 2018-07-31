export const TOGGLE_VIEW_MODE = 'APP/TOGGLE_VIEW_MODE/REQUEST';

// Actions
export const actionToggleViewMode = () => ({
  type: TOGGLE_VIEW_MODE,
});

export const actions = {
  [TOGGLE_VIEW_MODE]: actionToggleViewMode,
};

// Action Handlers
const ACTION_HANDLERS = {
  [TOGGLE_VIEW_MODE]: function(state, action) {
    return {
      ...state,
      viewMode: state.viewMode === 'map' ? 'list' : 'map',
    };
  },
};

// Reducer
const initialState = {
  viewMode: 'map',
};

export default function appReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

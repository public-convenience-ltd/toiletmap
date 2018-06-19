export const UPDATE_CENTER = 'LOO_MAP_ADD_EDIT/UPDATE_CENTER';

// Actions

export const actionUpdateCenter = center => ({
  type: UPDATE_CENTER,
  payload: {
    // { lat, lng }
    center,
  },
});

// Action Handlers

const ACTION_HANDLERS = {
  [UPDATE_CENTER]: function(state, action) {
    return Object.assign({}, state, {
      center: action.payload.center,
    });
  },
};

// Reducer

export default function looMapAddEditReducer(state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

import _ from 'lodash';

export const FIND_NEARBY_REQUEST = 'LOOS/FIND_NEARBY/REQUEST';
export const FIND_NEARBY_SUCCESS = 'LOOS/FIND_NEARBY/SUCCESS';
export const FIND_BY_ID_REQUEST = 'LOOS/FIND_BY_ID_REQUEST/SUCCESS';
export const FIND_BY_ID_SUCCESS = 'LOOS/FIND_BY_ID_SUCCESS/SUCCESS';
export const UNCACHE_BY_ID = 'LOOS/UNCACHE/BY_ID';
export const REPORT_REQUEST = 'LOOS/REPORT/REQUEST';
export const REPORT_SUCCESS = 'LOOS/REPORT/SUCCESS';
export const REMOVE_REQUEST = 'LOOS/REMOVE/REQUEST';
export const REMOVE_SUCCESS = 'LOOS/REMOVE/SUCCESS';
export const REPORT_PROCESS_PENDING = 'LOOS/REPORT_PROCESS_PENDING';

// Actions

export const actionFindNearbyRequest = (lng, lat, radius) => ({
  type: FIND_NEARBY_REQUEST,
  payload: {
    lng,
    lat,
    radius,
  },
});

export const actionFindNearbySuccess = loos => ({
  type: FIND_NEARBY_SUCCESS,
  payload: {
    loos,
  },
});

export const actionFindByIdRequest = id => ({
  type: FIND_BY_ID_REQUEST,
  payload: {
    id,
  },
});

export const actionFindByIdSuccess = loo => ({
  type: FIND_BY_ID_SUCCESS,
  payload: {
    loo,
  },
});

export const actionUncacheById = id => ({
  type: UNCACHE_BY_ID,
  payload: id,
});

export const actionReportRequest = (loo, from) => ({
  type: REPORT_REQUEST,
  payload: {
    loo,
    from,
  },
});

export const actionReportSuccess = loo => ({
  type: REPORT_SUCCESS,
  payload: loo,
});

export const actionRemoveRequest = (looId, reason) => ({
  type: REMOVE_REQUEST,
  payload: {
    looId,
    reason,
  },
});

export const actionRemoveSuccess = () => ({
  type: REMOVE_SUCCESS,
});

export const actionProcessPendingReports = () => ({
  type: REPORT_PROCESS_PENDING,
});

// Action Handlers

const ACTION_HANDLERS = {
  [UNCACHE_BY_ID]: function(state, action) {
    // Clear the stored loo reference to ensure we refetch
    let newById = _.omit(state.byId, action.payload);
    return {
      ...state,
      byId: newById,
    };
  },

  [FIND_NEARBY_SUCCESS]: function(state, action) {
    return {
      ...state,
      nearby: action.payload.loos || [],
    };
  },

  [FIND_BY_ID_SUCCESS]: function(state, action) {
    return {
      ...state,
      byId: {
        [action.payload.loo._id]: action.payload.loo,
      },
    };
  },
};

const initialState = {
  byId: {},
};

// Reducer
export default function loosReducer(state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}

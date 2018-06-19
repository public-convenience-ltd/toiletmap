export const FIND_NEARBY_REQUEST = 'LOOS/FIND_NEARBY/REQUEST';
export const FIND_NEARBY_SUCCESS = 'LOOS/FIND_NEARBY/SUCCESS';
export const FIND_BY_ID_REQUEST = 'LOOS/FIND_BY_ID_REQUEST/SUCCESS';
export const FIND_BY_ID_SUCCESS = 'LOOS/FIND_BY_ID_SUCCESS/SUCCESS';
export const REPORT_REQUEST = 'LOOS/REPORT/REQUEST';
export const REPORT_SUCCESS = 'LOOS/REPORT/SUCCESS';
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

export const actionReportRequest = loo => ({
  type: REPORT_REQUEST,
  payload: {
    loo,
  },
});

export const actionReportSuccess = () => ({
  type: REPORT_SUCCESS,
});

export const actionProcessPendingReports = () => ({
  type: REPORT_PROCESS_PENDING,
});

export const actions = {
  [FIND_NEARBY_REQUEST]: actionFindNearbyRequest,
  [FIND_NEARBY_SUCCESS]: actionFindNearbySuccess,
  [FIND_BY_ID_REQUEST]: actionFindByIdRequest,
  [FIND_BY_ID_SUCCESS]: actionFindByIdSuccess,
  [REPORT_REQUEST]: actionReportRequest,
  [REPORT_SUCCESS]: actionReportSuccess,
  [REPORT_PROCESS_PENDING]: actionProcessPendingReports,
};

// Action Handlers

const ACTION_HANDLERS = {
  [FIND_BY_ID_REQUEST]: function(state, action) {
    // Clear the stored loo reference on each request to ensure we
    // don't render against a cached instance
    return Object.assign({}, state, {
      byId: null,
    });
  },

  [FIND_NEARBY_SUCCESS]: function(state, action) {
    return Object.assign({}, state, {
      nearby: action.payload.loos || [],
    });
  },

  [FIND_BY_ID_SUCCESS]: function(state, action) {
    return Object.assign({}, state, {
      byId: action.payload.loo,
    });
  },
};

// Reducer

export default function loosReducer(state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}

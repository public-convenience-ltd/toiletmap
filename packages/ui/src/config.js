export const PREFERENCES_KEY = 'preferences';
export const PENDING_REPORT_KEY = 'pending_loo_report';
export const PENDING_REMOVE_KEY = 'pending_loo_removal';

export default {
  viewport: {
    mobile: 567,
  },
  apiEndpoint: '/api',
  nearestRadius: 50000, // meters
  nearestListLimit: 5,
  initialZoom: 16,
  minZoom: 12,
  maxZoom: 18,
  allowAddEditLoo: true,
};

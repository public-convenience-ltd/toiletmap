export const PREFERENCES_KEY = 'preferences';
export const PENDING_REPORT_KEY = 'pending_loo_report';
export const PENDING_REMOVE_KEY = 'pending_loo_removal';

export default {
  viewport: {
    mobile: 567,
  },
  apiEndpoint: '/api',
  reportEndpoint: '/api/reports',
  removeEndpoint: '/api/remove',
  nearest: {
    limit: 5,
    radius: 5000, // meters
  },
  initialZoom: 16,
  minZoom: 12,
  maxZoom: 18,
  allowAddEditLoo: true,
};

export const PREFERENCES_KEY = 'preferences';
export const PENDING_REPORT_KEY = 'pending_loo_report';
export const PENDING_REMOVE_KEY = 'pending_loo_removal';

export default {
  viewport: {
    mobile: 567,
  },
  analyticsId:
    process.env.NODE_ENV === 'production' ? 'UA-52513593-1' : 'UA-111111111-1',
  nearestRadius: 50000, // meters
  nearestListLimit: 5,
  initialZoom: 16,
  minZoom: 12,
  maxZoom: 18,
  editMinZoom: 16,
  allowAddEditLoo: true,
  showBackButtons: false,
  fallbackLocation: {
    // Trafalgar Square. Because.
    lat: 51.507351,
    lng: -0.127758,
  },
};

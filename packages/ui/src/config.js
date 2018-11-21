import { isOpen } from '@toiletmap/opening-hours';

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
  getSettings(namespace) {
    return JSON.parse(localStorage.getItem(namespace) || '{}');
  },
  getSetting(namespace, key) {
    return this.getSettings(namespace)[key];
  },
  setSetting(namespace, key, val) {
    var settings = this.getSettings(namespace);
    settings[key] = val;
    localStorage.setItem(namespace, JSON.stringify(settings));
  },

  // Compares the user's preferences with properties on the loo to
  // determine which preferences, if any, are met.
  checkPreferences(loo) {
    var preferences = this.getSettings(PREFERENCES_KEY);
    var result = {};

    if (!Object.keys(preferences).length) {
      return result;
    }

    // Map preference names to loo properties
    var map = {
      free: 'fee',
      accessible: 'accessibleType',
      open: 'opening',
      male: 'type',
      female: 'type',
      babychanging: 'babyChange',
    };

    Object.keys(preferences).forEach(name => {
      var value = loo.properties[map[name]];

      if (['', undefined, null].indexOf(value) !== -1) {
        return;
      }

      switch (name) {
        case 'free':
          result[name] =
            value === false ||
            value === 'false' ||
            value === 0 ||
            value === '0.00' ||
            value.toLowerCase() === 'free' ||
            value.toLowerCase() === 'none';
          break;

        case 'accessible':
          result[name] =
            value === false ||
            value === 'false' ||
            value.toLowerCase() !== 'none';
          break;

        case 'open':
          if (value !== '') {
            result[name] = isOpen(value);
          }
          break;

        case 'male':
          result[name] = /\bmale\b|unisex/.test(value);
          break;

        case 'female':
          result[name] = /\bfemale\b|unisex/.test(value);
          break;

        case 'babychanging':
          result[name] =
            value === true || value === 'true' || value !== 'false';
          break;

        default:
          break;
      }
    });

    return result;
  },
};

import { isOpen } from '@toiletmap/opening-hours';

export const PREFERENCES_KEY = 'preferences';

export default {
  viewport: {
    mobile: 567,
  },
  analyticsId:
    process.env.NODE_ENV === 'production' ? 'UA-52513593-1' : 'UA-111111111-1',
  nearestRadius: 20000, // meters
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
  getStage() {
    if (process.env.NODE_ENV === 'production') {
      if (window.location.hostname === 'www.toiletmap.org.uk') {
        return 'production';
      }

      return 'staging';
    }

    return process.env.NODE_ENV;
  },
  getSettings(namespace) {
    return JSON.parse(localStorage.getItem(namespace) || '{}');
  },
  getSetting(namespace, key, defaultVal) {
    const val = this.getSettings(namespace)[key];

    return val === undefined ? defaultVal : val;
  },
  setSetting(namespace, key, val) {
    var settings = this.getSettings(namespace);
    settings[key] = val;
    localStorage.setItem(namespace, JSON.stringify(settings));
  },
  setSettings(namespace, obj = {}) {
    localStorage.setItem(
      namespace,
      JSON.stringify({
        ...this.getSettings(namespace),
        ...obj,
      })
    );
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

    let gender = {
      male: preferences.male,
      female: preferences.female,
    };

    const wrongGender = {
      male: ['FEMALE'],
      female: ['MALE', 'MALE_URINAL'],
    };

    Object.keys(preferences).forEach(name => {
      var value = loo[map[name]];

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
          if (gender.male === gender.female) {
            result[name] = value !== 'NONE';
          } else if (gender.male) {
            result[name] = wrongGender.male.indexOf(value) === -1;
          } else if (gender.female) {
            result[name] = wrongGender.female.indexOf(value) === -1;
          }
          break;

        case 'open':
          if (value !== '') {
            result[name] = isOpen(value);
          }
          break;

        case 'male':
          result[name] = wrongGender.male.indexOf(value) === -1;
          break;

        case 'female':
          result[name] = wrongGender.female.indexOf(value) === -1;
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

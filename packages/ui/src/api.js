import querystring from 'querystring';
import OH from 'opening_hours';
import Cookies from 'js-cookie';

import config, { PREFERENCES_KEY, AUTH_KEY } from './config';

var api = {};

api.isAuthenticated = function() {
  return new Promise((resolve, reject) => {
    if (window.cordova) {
      // `window.cordova` is available before `window.cookieEmperor` so we poll until
      // we can have access
      var poller = setInterval(() => {
        if (window.cookieEmperor) {
          clearInterval(poller);

          window.cookieEmperor.getCookie(
            config.apiEndpoint,
            AUTH_KEY,
            data => {
              resolve(!!data.cookieValue);
            },
            () => {
              resolve(false);
            }
          );
        }
      }, 250);
    } else {
      resolve(!!Cookies.get(AUTH_KEY));
    }
  });
};

api.signout = function() {
  return new Promise((resolve, reject) => {
    fetch(config.signoutEndpoint).then(() => {
      if (window.cookieEmperor) {
        window.cookieEmperor.clearAll(resolve);
      } else {
        Cookies.remove(AUTH_KEY);
      }

      resolve();
    });
  });
};

api.findLoos = function(lng, lat, { limit, radius } = config.nearest) {
  // Todo: Fix the api to avoid this hard limit
  var qs = querystring.stringify({ limit: 1000, radius });
  var url = `${config.apiEndpoint}/loos/near/${lng}/${lat}?${qs}`;

  return fetch(url, {
    headers: new Headers({
      Accept: 'application/json',
    }),
  })
    .then(response => response.json())
    .then(geojson => geojson.features)
    .catch(err => console.log(err)); // Todo: handle this!
};

api.findLooById = function(id) {
  var endpoint = `${config.apiEndpoint}/loos/${id}?format=json`;

  return fetch(endpoint, {
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
  })
    .then(response => response.json())
    .catch(err => console.log(err)); // Todo: handle this!
};

api.reportLoo = function(loo) {
  // Todo: Handle HTTP 401
  return fetch(config.reportEndpoint, {
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    mode: 'no-cors', // opaque
    method: 'POST',
    body: JSON.stringify(loo),
  }).catch(err => console.log(err)); // Todo: handle this!
};

api.getSettings = function(namespace) {
  return JSON.parse(localStorage.getItem(namespace) || '{}');
};

api.getSetting = function(namespace, key) {
  return this.getSettings(namespace)[key];
};

api.setSetting = function(namespace, key, val) {
  var settings = this.getSettings(namespace);

  settings[key] = val;

  localStorage.setItem(namespace, JSON.stringify(settings));
};

// Compares the user's preferences with properties on the loo to
// determine which preferences, if any, are met.
api.checkPreferences = function(loo) {
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
          result[name] = new OH(value).getState();
        }
        break;

      case 'male':
        result[name] = /\bmale\b|unisex/.test(value);
        break;

      case 'female':
        result[name] = /\bfemale\b|unisex/.test(value);
        break;

      case 'babychanging':
        result[name] = value === true || value === 'true' || value !== 'false';
        break;

      default:
        break;
    }
  });

  return result;
};

api.humanize = function(val) {
  // Unknown
  if (val === undefined || val === null) {
    return 'Not known';
  }

  // Capitalise
  if (typeof val === 'string') {
    val = val
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  // Readable boolean
  if (
    typeof val === 'boolean' ||
    (typeof val === 'string' &&
      ['true', 'false'].indexOf(val.toLowerCase()) !== -1)
  ) {
    val = JSON.parse((val + '').toLowerCase()) ? 'Yes' : 'No';
  }

  // Pricing
  if (val === '0.00') {
    val = 'Free';
  }

  return val;
};

export default api;

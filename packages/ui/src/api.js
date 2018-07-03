import querystring from 'querystring';
import OH from 'opening_hours';

import config, { PREFERENCES_KEY } from './config';

const api = {};

api.findLoos = async function(lng, lat, { limit, radius } = config.nearest) {
  // Todo: Fix the api to avoid this hard limit
  const qs = querystring.stringify({ limit: 1000, radius });
  const url = `${config.apiEndpoint}/loos/near/${lng}/${lat}?${qs}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  const geojson = await res.json();
  return geojson.features;
};

api.findLooById = async function(id) {
  const url = `${config.apiEndpoint}/loos/${id}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  return await res.json();
};

api.reportLoo = async function(report, token) {
  // Todo: Handle HTTP 401
  const url = `${config.apiEndpoint}/reports`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'post',
    body: JSON.stringify(report),
  });
  if (res.status !== 201) {
    throw new Error(res.statusText);
  }
  return await res.json();
};

api.removeLoo = async function(looId, reason, token) {
  // Todo: Handle HTTP 401
  const url = `${config.apiEndpoint}/reports/${looId}`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'delete',
    body: JSON.stringify({
      removal_reason: reason,
    }),
  });
  if (res.status !== 200) {
    throw new Error(res.statusText);
  }
  return res.status;
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

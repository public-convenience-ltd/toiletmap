import querystring from 'querystring';
import { isOpen } from '@neontribe/opening-hours';

import mappings from './src/mappings';

export const PREFERENCES_KEY = 'preferences';

class API {
  constructor() {
    if (!API.instance) {
      API.instance = this;
    }
  }

  get endpoint() {
    return process.env.NODE_ENV === 'production'
      ? '/api'
      : process.env.REACT_APP_GBPTM_API || '/api';
  }

  async findLoos(lng, lat, radius) {
    const qs = querystring.stringify({ radius });
    const url = `${this.endpoint}/loos/near/${lng}/${lat}?${qs}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    const geojson = await res.json();
    return geojson.features;
  }

  async findLooById(id, params) {
    const query = querystring.stringify(params);
    const url = `${this.endpoint}/loos/${id}?${query}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    return await res.json();
  }

  async searchLoos(q) {
    const query = querystring.stringify(q);
    const url = `${this.endpoint}/search?${query}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
    return await res.json();
  }

  async reportLoo(report, token) {
    // Todo: Handle HTTP 401
    const url = `${this.endpoint}/reports`;
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
  }

  async removeLoo(looId, reason, token) {
    // Todo: Handle HTTP 401
    const url = `${this.endpoint}/reports/${looId}`;
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
  }

  async fetchAreaData() {
    const searchUrl = `${this.endpoint}/admin_geo/areas`;
    const response = await fetch(searchUrl);
    return await response.json();
  }

  async fetchAreaStatistics(q) {
    const query = querystring.stringify(q);
    const searchUrl = `${this.endpoint}/statistics/areas?${query}`;
    const response = await fetch(searchUrl);
    return await response.json();
  }

  async fetchCountersStatistics(q) {
    const query = querystring.stringify(q);
    const searchUrl = `${this.endpoint}/statistics/counters?${query}`;
    const response = await fetch(searchUrl);
    return await response.json();
  }

  async fetchProportionsStatistics(q) {
    const query = querystring.stringify(q);
    const searchUrl = `${this.endpoint}/statistics/proportions?${query}`;
    const response = await fetch(searchUrl);
    return await response.json();
  }

  async fetchContributors() {
    const searchUrl = `${this.endpoint}/statistics/contributors`;
    const response = await fetch(searchUrl);
    return await response.json();
  }

  getSettings(namespace) {
    return JSON.parse(localStorage.getItem(namespace) || '{}');
  }

  getSetting(namespace, key) {
    return this.getSettings(namespace)[key];
  }

  setSetting(namespace, key, val) {
    var settings = this.getSettings(namespace);
    settings[key] = val;
    localStorage.setItem(namespace, JSON.stringify(settings));
  }

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
  }
}

const api = new API();
Object.freeze(api);

export default api;

export { api, mappings };

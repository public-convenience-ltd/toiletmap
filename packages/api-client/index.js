import querystring from 'querystring';
import mappings from './src/mappings';

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
    return await res.json();
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
}

const api = new API();
Object.freeze(api);

export default api;

export { api, mappings };

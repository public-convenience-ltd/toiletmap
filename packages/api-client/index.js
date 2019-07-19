import querystring from 'querystring';
import mappings from './src/mappings';
import axios from 'axios';

const endpoint = '/api';

class API {
  constructor() {
    if (!API.instance) {
      API.instance = this;
    }
  }

  async findLoos(lng, lat, radius) {
    const qs = querystring.stringify({ radius });
    const url = `${endpoint}/loos/v2/near/${lng}/${lat}?${qs}`;
    const res = await axios({
      url,
      headers: {
        Accept: 'application/json',
      },
    });
    return res.data;
  }

  async findLooById(id, params) {
    const query = querystring.stringify(params);
    const url = `${endpoint}/loos/v2/${id}?${query}`;
    const res = await axios({
      url,
      headers: {
        Accept: 'application/json',
      },
    });
    return res.data;
  }

  async searchLoos(q) {
    const query = querystring.stringify(q);
    const url = `${endpoint}/search?${query}`;
    const res = await axios({
      url,
      headers: {
        Accept: 'application/json',
      },
    });
    return res.data;
  }

  async reportLoo(report, token, from) {
    // Todo: Handle HTTP 401
    const url = `${endpoint}/reports`;
    const res = await axios({
      url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'post',
      data: {
        report,
        from: from ? from._id : null,
      },
    });
    if (res.status !== 201) {
      throw new Error(res.statusText);
    }
    return res.data;
  }

  async removeLoo(looId, reason, token) {
    // Todo: Handle HTTP 401
    const url = `${endpoint}/reports/${looId}`;
    const res = await axios({
      url,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: 'delete',
      data: {
        removal_reason: reason,
      },
    });
    if (res.status !== 200) {
      throw new Error(res.statusText);
    }
    return res.status;
  }

  async fetchAreaData() {
    const searchUrl = `${endpoint}/admin_geo/areas`;
    const res = await axios(searchUrl);
    return res.data;
  }

  async fetchAreaStatistics(q) {
    const query = querystring.stringify(q);
    const searchUrl = `${endpoint}/statistics/areas?${query}`;
    const res = await axios(searchUrl);
    return res.data;
  }

  async fetchProportionsStatistics(q) {
    const query = querystring.stringify(q);
    const searchUrl = `${endpoint}/statistics/proportions?${query}`;
    const res = await axios(searchUrl);
    return res.data;
  }

  async fetchContributors() {
    const searchUrl = `${endpoint}/statistics/contributors`;
    const res = await axios(searchUrl);
    return res.data;
  }
}

const api = new API();
Object.freeze(api);

export default api;

export { api, mappings };

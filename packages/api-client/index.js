import querystring from 'querystring';
import mappings from './src/mappings';
import axios from 'axios';

class API {
  constructor(prefix = '/api') {
    if (!API.instance) {
      API.instance = this;
    }

    this.prefix = prefix;
  }

  async findLoos(lng, lat, radius) {
    const qs = querystring.stringify({ radius });
    const url = `${this.prefix}/loos/v2/near/${lng}/${lat}?${qs}`;
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
    const url = `${this.prefix}/loos/v2/${id}?${query}`;
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
    const url = `${this.prefix}/search?${query}`;
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
    const url = `${this.prefix}/reports`;
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
    const url = `${this.prefix}/reports/${looId}`;
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
    const searchUrl = `${this.prefix}/admin_geo/areas`;
    const res = await axios(searchUrl);
    return res.data;
  }

  async fetchContributors() {
    const searchUrl = `${this.prefix}/statistics/contributors`;
    const res = await axios(searchUrl);
    return res.data;
  }
}

const api = new API();
Object.freeze(api);

export default api;

export { api, mappings, API };

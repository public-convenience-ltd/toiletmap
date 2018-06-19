'use strict';

var path = require('path');
var _ = require('lodash');

var base = {
  app: {
    root: path.normalize(path.join(__dirname, '/..')),
    port: process.env.PORT || 3003,
    env: process.env.NODE_ENV || 'development',
    baseUrl:
      process.env.BASE_URL || 'http://localhost:' + process.env.PORT || 3003,
  },
  auth: {
    mount: '/auth',
    local: {
      username: process.env.LOCAL_USERNAME,
      password: process.env.LOCAL_PASSWORD,
    },
    bearer: {
      token: process.env.BEARER_TOKEN,
      info: process.env.BEARER_INFO,
    },
  },
  mapit: {
    apiKey: process.env.MAPIT_KEY,
  },
  mongo: {
    url:
      process.env.MONGO_URL ||
      process.env.MONGOHQ_URL ||
      process.env.MONGOLAB_URI ||
      'mongodb://localhost:27017/gbptm',
  },
  query_defaults: {
    maxDistance: 50000,
    limit: 5,
  },
  deduplication: {
    radius: 25,
    anon_attributions: ['Anonymous'],
  },
  reports: {
    trust: 8,
  },
};

var platforms = {
  development: {
    auth: {
      local: {
        username: 'test',
        password: 'test',
      },
    },
  },
  test: {
    app: {
      port: 3001,
    },
    mongo: {
      url: 'mongodb://localhost:27017/gbptm-test',
    },
    auth: {
      local: {
        username: 'test',
        password: 'test',
      },
    },
  },
  production: {},
  staging: {},
  importer: {},
};

_.merge(base, platforms[base.app.env]);
module.exports = base;

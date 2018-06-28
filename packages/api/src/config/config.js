'use strict';

var _ = require('lodash');

var base = {
  app: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
  },
  auth: {
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
      process.env.MONGODB_URI ||
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
    anon_attributions: ['Anonymous', 'GBPTM Contributor'],
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

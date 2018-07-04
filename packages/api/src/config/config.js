'use strict';

var _ = require('lodash');

var base = {
  app: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
  },
  auth0: {
    userinfoUrl: 'https://gbptm.eu.auth0.com/userinfo',
  },
  mapit: {
    apiKey: process.env.MAPIT_API_KEY,
    endpoint: 'http://mapit.mysociety.org/point/4326/',
    areaTypes: [
      'District council',
      'Unitary Authority',
      'Metropolitan district',
      'London borough',
    ],
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
    defaultRadius: 5000,
    maxRadius: 50000,
  },
  deduplication: {
    radius: 25,
  },
  reports: {
    trust: 8,
    anonContributor: 'GBPTM Contributor',
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

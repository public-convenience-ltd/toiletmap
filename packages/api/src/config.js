var _ = require('lodash');

var base = {
  app: {
    port: process.env.PORT || 8080,
    env: process.env.NODE_ENV || 'development',
  },
  auth0: {
    userinfoUrl: 'https://gbptm.eu.auth0.com/userinfo',
    jwksUri: 'https://gbptm.eu.auth0.com/.well-known/jwks.json',
    audience: 'https://www.toiletmap.org.uk/api',
    issuer: 'https://gbptm.eu.auth0.com/',
    algorithms: ['RS256'],
    permissionsKey: 'https://toiletmap.org.uk/permissions',
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
    url: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gbptm',
  },
  graphql: {
    engine: {
      apiKey: process.env.ENGINE_API_KEY,
    },
    playground: {
      tabs: [
        {
          endpoint: '/graphql',
          name: 'Nearby Loos Query',
          query:
            'query loosNearNeontribe {\n\tloosByProximity(from: {lat: 52.6335, lng: 1.2953, maxDistance: 500}) {\n\t\tid\n\t\tname\n\t}\n}',
        },
      ],
    },
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

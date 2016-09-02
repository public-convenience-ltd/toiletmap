'use strict'

var path = require('path')
var _ = require('lodash')
var version = require('../package.json').version


var base = {
  app: {
    root: path.normalize(__dirname + '/..'),
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:'+ process.env.PORT || 3000,
    readonly: process.env.READONLY || false,
    enableHttps: false
  },
  auth: {
    mount: '/auth',
    local: {
      username: process.env.LOCAL_USERNAME,
      password: process.env.LOCAL_PASSWORD
    },
    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET
    },
    twitter: {
      consumerKey: process.env.TWITTER_CLIENT_ID,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET
    },
    osm: {
      consumerKey: process.env.OSM_CLIENT_ID,
      consumerSecret: process.env.OSM_CLIENT_SECRET
    },
    facebook: {
      client_id: process.env.FACEBOOK_CLIENT_ID,
      client_secret: process.env.FACEBOOK_CLIENT_SECRET
    },
    google: {
      consumerKey: process.env.GOOGLE_CLIENT_ID,
      consumerSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  mapit:{
	apiKey: process.env.MAPIT_KEY
  },
  mongo: {
    url: process.env.MONGO_URL || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/gbptm'
  },
  query_defaults: {
    maxDistance: 50000,
    limit: 5
  },
  deduplication: {
    radius: 25,
    anon_attributions: ['Anonymous']
  },
  reports: {
    trust: 8
  },
  ui: {
    api: {
      root: process.env.GBPTM_API_ROOT ||'http://localhost:'+ process.env.PORT || 3000, 
    },
    map: {
      center: [51.50109067037534, -0.17943490587640554],
      zoom: 15
    },
    app: {
      readonly: process.env.READONLY || false,
      baseURL: process.env.BASE_URL ||'http://localhost:'+ process.env.PORT || 3000, 
      version: version,
      cache: {
        maxage: 365 * 24 * 60 * 1000
      }
    }
  }
}

var platforms = {
  development: {
    auth: {
      local: {
        username: 'test',
        password: 'test'
      }
    }
  },
  test: {
    app: {
      port: 3001
    },
    mongo: {
      url: 'mongodb://localhost:27017/gbptm-test'
    },
    auth: {
      local: {
        username: 'test',
        password: 'test'
      }
    }
  },
  production: {
    app: {
      enableHttps: true
    },
    ui: {
      app: {
        cache: {
          maxage: 365 * 24 * 60 * 1000
        }
      }
    }
  },
  staging: {
    app: {
      enableHttps: true
    },
    ui: {
      app: {
        cache: {
          maxage: 24 * 60 * 1000
        }
      }
    }
  },
  importer: {}
}

_.merge(base, platforms[base.app.env])
module.exports = base

'use strict';

var path = require('path'),
    _ = require('lodash');

var base = {
    app: {
        root: path.normalize(__dirname + '/..'),
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        baseUrl: process.env.BASE_URL || 'http://localhost:3000'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'SEEKRIT'
    },
    auth: {
        mount: '/auth',
        local: {
            username: process.env.LOCAL_USERNAME,
            password: process.env.LOCAL_PASSWORD,
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
    mongo: {
        url: process.env.MONGO_URL || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/gbptm'
    },
    query_defaults: {
        maxDistance: 50000,
        limit: 5
    },
    paginate: {
        perPage: 10,
        delta: 0,
        page: 0,
        offset: 0
    },
    deduplication: {
        radius: 25,
        anon_attributions: ['Anonymous']
    },
    reports: {
        trust: 8
    }
};

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

    },
    staging: {
        
    },
    importer: {

    }
};

_.merge(base, platforms[base.app.env]);
module.exports = base;
'use strict';

var path = require('path'),
    _ = require('lodash');

var base = {
    app: {
        root: path.normalize(__dirname + '/..'),
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },
    mongo: {
        url: process.env.MONGO_URL || process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/gbptm'
    },
    query_defaults: {
        maxDistance: 200
    }
};

var platforms = {
    development: {
        mongo: {
            url: 'mongodb://localhost:27017/gbptm-dev'
        }
    },
    test: {
        app: {
            port: 3001
        },
        mongo: {
            url: 'mongodb://localhost:27017/gbptm-test'
        }
    },
    production: {

    },
    staging: {
        
    }
};

_.merge(base, platforms[base.app.env]);
module.exports = base;
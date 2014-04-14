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
        url: process.env.MONGO_url || 'mongodb://localhost:27017/gbptm'
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
    }
};

_.merge(base, platforms[base.app.env]);
module.exports = base;
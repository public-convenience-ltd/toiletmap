'use strict';

var fs = require('fs'),
    path = require('path'),
    logger = require('koa-logger'),
    router = require('koa-router'),
    config = require('./config');

module.exports = function(app){
    if (config.app.env !== 'test') {
        app.use(logger());
    }

    app.use(router(app));

    // mount all the routes defined in the api/controllers
    fs.readdirSync(path.join(config.app.root, 'api', 'controllers')).forEach(function(file){
        require(path.join(config.app.root, 'api', 'controllers', file)).init(app);
    });
};
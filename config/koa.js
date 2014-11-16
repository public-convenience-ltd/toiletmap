'use strict';

var fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    logger = require('koa-logger'),
    compose = require('koa-compose'),
    mount = require('koa-mount'),
    router = require('koa-router'),
    favicon = require('koa-favicon'),
    cors = require('koa-cors'),
    jsonp = require('koa-jsonp'),
    json = require('koa-json'),
    gzip = require('koa-gzip'),
    helmet = require('koa-helmet'),
    jwt = require('koa-jwt'),
    serializer = require('../lib/koa-serializer'),
    config = require('./config'),
    auth = require('../auth/auth'),
    passport = require('koa-passport'),
    session = require('koa-session'),
    paginate = require('../lib/koa-paginate');


module.exports = function(app){
    app.keys = ['seekrit'];
    app.use(helmet.defaults()); // Some basic hardening
    if (config.app.env !== 'test') {
        app.use(logger());
    }
    app.use(favicon()); // Bounce annoying favicon requests with a 404
    app.use(cors());
    app.use(gzip());
    app.use(jsonp());
    app.use(serializer());
    app.use(json({ pretty: false, param: 'pretty' }));
    app.use(paginate(config.paginate));
    app.use(session());
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.use(router(app));

    // Auth routes for token retrieval
    
    _.each(auth.routes, function(route, name){
        app[route.method](name, config.auth.mount + route.path, route.handler);
    });
    
    // mount all the routes defined in the api/controllers/public
    fs.readdirSync(path.join(config.app.root, 'api', 'v2', 'controllers', 'public')).forEach(function(file){
        var routes = require(path.join(config.app.root, 'api', 'v2', 'controllers', 'public', file));
        _.each(routes, function(route, name){
            app[route.method](name, route.path, route.handler);
        });
    });
    // mount all the routes defined in the api/controllers/private composing each with authorization middleware
    fs.readdirSync(path.join(config.app.root, 'api', 'v2', 'controllers', 'private')).forEach(function(file){
        var routes = require(path.join(config.app.root, 'api', 'v2', 'controllers', 'private', file));
        _.each(routes, function(route, name){
            var protected_handler = compose([
                    jwt({ secret: config.jwt.secret }),
                    route.handler
                ]);
            app[route.method](name, route.path, protected_handler);
        });
    });

    app.use(function*routeNotImplemented(next){
        yield next;
        if (this.status) { return; } // Already handled
        this.throw(501);
    });
};
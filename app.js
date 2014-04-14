'use strict';

var config = require('./config/config'),
    koaConfig = require('./config/koa'),
    co = require('co'),
    koa = require('koa'),
    app = koa();

app.init = co(function *(){
    koaConfig(app);
    app.server = app.listen(config.app.port);
    if (config.app.env !== 'test') {
        console.log('gbptm-api server listening on port ' + config.app.port);
    }
});

// auto-init if this app is not being initialised by another module
if (!module.parent) {
    app.init();
}

module.exports = app;
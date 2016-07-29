'use strict'
if (process.env.NODE_ENV === 'production') {
    require('newrelic')
}
var config = require('./config/config')
var koaConfig = require('./config/koa')
require('./config/mongo')
var co = require('co')
var koa = require('koa')
var app = koa()
require('./config/mongo') // don't much like this bare require

app.init = co.wrap(function * (config) {
  koaConfig(app,config)
  app.server = app.listen(config.app.port)
  if (config.app.env !== 'test') {
    console.log('gbptm-api server listening on port ' + config.app.port)
  }
})

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.init(config)
}

module.exports = app

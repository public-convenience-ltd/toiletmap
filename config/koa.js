'use strict'

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var logger = require('koa-logger')
var router = require('koa-router')
var cors = require('koa-cors')
var json = require('koa-json')
var compress = require('koa-compress')
var helmet = require('koa-helmet')
// var config = require('./config')
var session = require('koa-session')

module.exports = function (app, config) {
  app.keys = ['seekrit']
  if (config.app.enableHttps) {
      // Force HTTPS on all page
    app.use(function * (next) {
      if (this.secure || this.request.header['x-forwarded-proto'] === 'https') {
        return yield next
      }
      this.response.redirect(config.app.baseUrl + this.request.url)
    })
  }

  app.use(helmet({frameguard: false, contentSecurityPolicy: false})) // Some basic hardening
  if (config.app.env !== 'test') {
    app.use(logger())
  }

  app.use(cors())
  app.use(compress())
  app.use(json({ pretty: false, param: 'pretty' }))
  app.use(session(app))
  app.use(router(app))

  // mount all the routes defined in the api/public
  fs.readdirSync(path.join(config.app.root, 'api', 'public')).forEach(function (file) {
    var routes = require(path.join(config.app.root, 'api', 'public', file))
    _.each(routes, function (route, name) {
      app[route.method](name, route.path, route.handler)
    })
  })

  app.use(function * routeNotImplemented (next) {
    yield next
    if (this.status) {
      return // Already handled
    }
    this.throw(501)
  })
}

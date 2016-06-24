'use strict'

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var sslify = require('koa-sslify')
var logger = require('koa-logger')
var compose = require('koa-compose')
var router = require('koa-router')
var favicon = require('koa-favicon')
var cors = require('koa-cors')
var json = require('koa-json')
var compress = require('koa-compress')
var mime_query = require('../lib/koa-mime-query')
var passport = require('koa-passport')
var helmet = require('koa-helmet')
var config = require('./config')
var session = require('koa-session')
var readonly = require('../lib/readonly-mode')
var auth = require('../auth/auth.js')
var ui = require('../ui/ui.js')
var resumer = require('../lib/resumer')

module.exports = function (app) {
  app.keys = ['seekrit']
  if (config.app.enableHttps) {
      // Force HTTPS on all page
      app.use(enforceHttps({
          trustProtoHeader: true
      }))
  }

  app.use(helmet({frameguard: false, contentSecurityPolicy: false})) // Some basic hardening
  if (config.app.env !== 'test') {
    app.use(logger())
  }
  app.use(favicon()) // Bounce annoying favicon requests with a 404
  if (config.app.readonly) {
    app.use(readonly())
  }

  app.use(cors())
  app.use(compress())
  app.use(json({ pretty: false, param: 'pretty' }))
  app.use(session(app))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(resumer())
  ui.init(app, config.ui)
  app.use(mime_query())
  app.use(router(app))

  // mount all the routes defined in the api/public
  fs.readdirSync(path.join(config.app.root, 'api', 'public')).forEach(function (file) {
    var routes = require(path.join(config.app.root, 'api', 'public', file))
    _.each(routes, function (route, name) {
      app[route.method](name, route.path, route.handler)
    })
  })

  // Auth routes
  _.each(auth.routes, function (route, name) {
    app[route.method](name, config.auth.mount + route.path, route.handler)
  })

  // mount all the routes defined in the api/private composing each with authorization middleware
  fs.readdirSync(path.join(config.app.root, 'api', 'private')).forEach(function (file) {
    var routes = require(path.join(config.app.root, 'api', 'private', file))
    _.each(routes, function (route, name) {
      var protected_handler = compose([
        function * (next) {
          if (this.isAuthenticated()) {
            yield next
          } else {
            this.redirect('/signin?redirect=' + this.request.url)
          }
        },
        route.handler
      ])
      app[route.method](name, route.path, protected_handler)
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

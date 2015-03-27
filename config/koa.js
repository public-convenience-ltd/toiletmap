'use strict'

var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var logger = require('koa-logger')
var compose = require('koa-compose')
var router = require('koa-router')
var favicon = require('koa-favicon')
var cors = require('koa-cors')
var jsonp = require('koa-jsonp')
var json = require('koa-json')
var gzip = require('koa-gzip')
var passport = require('koa-passport')
var helmet = require('koa-helmet')
var config = require('./config')
var session = require('koa-session')
var paginate = require('../lib/koa-paginate')
var readonly = require('../lib/readonly-mode')
var auth = require('../auth/auth.js')
var ui = require('../ui/ui.js')
var resumer = require('../lib/resumer')

module.exports = function (app) {
  app.keys = ['seekrit']
  app.use(helmet.defaults({xframe: false, csp: false})) // Some basic hardening
  if (config.app.env !== 'test') {
    app.use(logger())
  }
  app.use(favicon()) // Bounce annoying favicon requests with a 404
  if (config.app.readonly) {
    app.use(readonly())
  }

  app.use(cors())
  app.use(gzip())
  app.use(jsonp())
  app.use(json({ pretty: false, param: 'pretty' }))
  app.use(paginate(config.paginate))
  app.use(session(app))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use(resumer())
  ui.init(app, config.ui)
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

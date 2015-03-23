'use strict'

var config = require('./config')
var koa = require('koa')
var router = require('koa-router')
var khbs = require('koa-hbs')
var helpers = require('./helpers')(khbs.handlebars)
var koaBody = require('koa-body')()
var helmet = require('koa-helmet')
var request = require('co-request')
var _ = require('lodash')
var objectPath = require('object-path')
var app = koa()

function hbs_defaults () {
  return function * (next) {
    this.renderDefaults = function * (tpl, data) {
      _.merge(data, {
        config: config,
        prefs: JSON.parse(this.cookies.get('prefs') || '{}'),
        flash: this.flash,
        backlink: this.req.headers.referer || config.app.baseURL
      })
      yield this.render.apply(this, [tpl, data])
    }
    yield next
  }
}

var routes = {
    standalone_map: function * (next) {
      yield this.renderDefaults('map', {
        macromap: {
          center: [parseFloat(this.params.lat), parseFloat(this.params.lon)],
          zoom: 15
        },
        looid: this.request.query.looid
      })
    },
    remove: function * (next) {
      var token
      var loo = yield request(config.api.root + this.req.url.replace('remove', 'loos'), {json: true})
      if (loo.statusCode !== 200) {
        this.throw(loo.statusCode)
      }

      if (this.method === 'GET') {
        yield this.renderDefaults('remove', {
          loo: loo.body,
          macromap: {
            center: loo.body.geometry.coordinates.slice().reverse(),
            zoom: 17
          },
          attribute_to: this.cookies.get('attribute_to') || ''
        })
      }

      if (this.method === 'POST') {
        if (this.request.query.token) {
          token = this.session.token = this.request.query.token
        }

        var report = _.pick(loo.body, 'type', 'geometry')
        _.extend(report, {
          properties: {
            active: false,
            access: 'none',
            removal_reason: this.request.body.removal_reason
          },
          origin: this.request.body.origin
        })
        try {
          yield request.post({
            url: config.api.root + '/reports',
            headers: {
              'Authorization': 'Bearer ' + token
            },
            json: true,
            body: report
          })

          this.flash = {
            type: 'status',
            msg: "Thanks! We won't show that toilet on the map any more."
          }

          this.redirect('/loos/near/' + loo.body.geometry.coordinates[0] + '/' + loo.body.geometry.coordinates[1])
        } catch (e) {
          throw e
        }
      }
    },
    signin: function * (next) {
      yield this.renderDefaults('signin', {
        redirect: this.request.query.redirect
      })
    },
    reports: function * (next) {
      var r
      var loo
      var macromap

      if (this.request.query.token) {
        this.session.token = this.request.query.token
      }
      if (this.cookies.get('resume_loo_report')) {
        this.request.body = JSON.parse(this.cookies.get('resume_loo_report'))
        this.method = 'POST'
      }

      if (this.method === 'GET') {
        if (this.request.query.base) {
          r = yield request(config.api.root + '/loos/' + this.request.query.base, {json: true})
          if (r.statusCode === 200) {
            loo = r.body
          }
        }
        macromap = {
          zoom: 18,
          locate: loo ? false : true
        }
        if (loo) {
          macromap.center = loo.geometry.coordinates.slice().reverse()
        }

        yield this.renderDefaults('edit', {
          loo: loo,
          macromap: macromap
        })
      }

      if (this.method === 'POST') {
        // Do we have a token for the api?
        if (!this.session.token) {
          // save the posted data to a cookie
          this.cookies.set('resume_loo_report', JSON.stringify(this.request.body))
          // redirect the user to signin
          this.redirect('/signin?redirect=' + config.app.baseURL + '/reports')
        } else {
          var report = _.transform(this.request.body, function (result, val, key) {
            var ka = _.map(key.split('.'), function (v) {
              var parsed = parseInt(v, 10)
              return isNaN(parsed) ? v : parsed
            })
            // Filter out empty form values
            if (val !== '') {
              objectPath.set(result, ka, val)
            }
          }, {geometry: {coordinates: []}}) // NB. Ugly template is here to coerce the coordinates array

          try {
            var post = yield request.post({
              url: config.api.root + '/reports',
              headers: {
                'Authorization': 'Bearer ' + this.session.token
              },
              json: true,
              body: report
            })

            // All went well - unset any resume cookie
            if (this.cookies.get('resume_loo_report')) {
              this.cookies.set('resume_loo_report')
            }

            this.flash = {
              type: 'status',
              msg: "Thanks! We've updated this toilet with the information you supplied."
            }

            this.redirect(post.headers['content-location'])
          } catch (e) {
            throw e
          }
        }
      }
    }
  }

app.init = function () {
  app.keys = ['SEEKRIT']
  app.use(helmet.defaults({xframe: false, csp: false}))
  if (config.app.env !== 'test') {
    app.use(require('koa-logger')())
  }
  app.use(require('koa-gzip')())
  app.use(require('koa-fresh')())
  app.use(require('koa-etag')())
  _.each(helpers, function (helper, name) {
    khbs.registerHelper(name, helper)
  })
  app.use(khbs.middleware({
    viewPath: __dirname + '/views/pages',
    partialsPath: __dirname + '/views/partials',
    layoutsPath: __dirname + '/views/layouts',
    defaultLayout: 'base',
    extname: '.hbs'
  }))
  app.use(hbs_defaults())
  app.use(require('koa-session')())
  app.use(require('koa-flash')())
  app.use(router(app))
  app.all('/remove/:id', koaBody, routes.remove)
  app.get('/map/:lon/:lat', routes.standalone_map)
  app.get('/signin', routes.signin)
  app.all('/reports', koaBody, routes.reports)
  app.use(require('koa-static')(__dirname + '/public', {
    maxage: config.app.cache.maxage
  }))

  return app
}

// auto-init if this app is not being initialised by another module
if (!module.parent) {
  app.init()
}
module.exports = app

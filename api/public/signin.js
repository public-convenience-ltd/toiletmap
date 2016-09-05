'use strict'

var config = require('../../config/config.js')
var routes = {}

routes.prefences = {
  handler: function * () {
    yield this.renderDefaults('signin', {
      redirect: this.request.query.redirect,
      localusers: (config.auth.local.username && config.auth.local.password)
    })
  },
  path: '/signin',
  method: 'get'
}

module.exports = routes

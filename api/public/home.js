'use strict'

var routes = {}
var config = require('../../config/config')
var Loo = require('../../models/loo')

routes.home = {
  handler: function * () {
    var maxDistance = this.query.radius || config.query_defaults.maxDistance
    var limit = this.query.limit || config.query_defaults.limit
    var lon = config.ui.map.center[1]
    var lat = config.ui.map.center[0]
    var loos = yield Loo.findNear(lon, lat, maxDistance, limit).exec()
    switch (this.accepts('html', 'json')) {
      case 'html':
        yield this.renderDefaults('home', {
          loo: loos,
          macromap: {
            locate: true
          }
        })
        break
      case 'json':
        break
    }
  },
  path: '/',
  method: 'get'
}

module.exports = routes

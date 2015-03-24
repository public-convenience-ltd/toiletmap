'use strict'

var routes = {}

routes.prefences = {
  handler: function * () {
    yield this.renderDefaults('preferences', {})
  },
  path: '/preferences',
  method: 'get'
}

module.exports = routes

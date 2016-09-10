'use strict'

var routes = {}

routes.prefences = {
  handler: function * () {
    yield this.renderDefaults('about', {})
  },
  path: '/about',
  method: 'get'
}

module.exports = routes

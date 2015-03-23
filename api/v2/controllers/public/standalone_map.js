'use strict'

var routes = {}

routes.prefences = {
  handler: function * () {
    yield this.renderDefaults('map', {
      macromap: {
        center: [parseFloat(this.params.lat), parseFloat(this.params.lon)],
        zoom: 15
      },
      looid: this.request.query.looid
    })
  },
  path: '/map/:lon/:lat',
  method: 'get'
}

module.exports = routes

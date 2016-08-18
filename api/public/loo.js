'use strict'

var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var config = require('../../config/config')
var routes = {}

routes.nearby_loos = {
    handler: function * () {
      var maxDistance = this.query.radius || config.query_defaults.maxDistance
      var limit = this.query.limit || config.query_defaults.limit
      var loos = yield Loo.findNear(this.params.lon, this.params.lat, maxDistance, limit).exec()
      switch (this.accepts('html', 'json')) {
        case 'html':
          yield this.renderDefaults('list', {
            loos: loos,
            macromap: {
              center: [parseFloat(this.params.lat), parseFloat(this.params.lon)],
              zoom: 17
            }
          })
          break
        case 'json':
          this.status = 200
          this.body = new LooList(loos)
          break
      }
    },
    path: '/loos/near/:lon/:lat',
    method: 'get'
}

routes.loos_in = {
  handler: function * () {
    var loos = yield Loo.findIn(this.params.sw, this.params.ne, this.params.nw, this.params.se).exec()
    this.status = 200
    this.body = loos
  },
  path: '/loos/in/:sw/:ne/:nw/:se',
  method: 'get'
}

routes.loos_ids = {
  handler: function * () {
    var loos = yield Loo.findIds().exec()
    this.status = 200
    this.body = new LooList(loos)
  },
  path: '/loos',
  method: 'get'
}

routes.loos_updateArea = {
  handler: function * () {
    this.body = "hey I'm updating the thing now...not really this is just a test"
	//note for future me, you need to write a static method on the loo model which will call the api and update the area for a loo
    var loos = yield Loo.updateArea(this.params.id).exec()
    this.status = 200
    this.body = new LooList(loos)

  },
  path: '/loos/:id/updateArea',
  method: 'get'
}



routes.loo = {
  handler: function * () {
    var loo = yield Loo.findById(this.params.id).exec()
    if (!loo) {
      return
    }
    switch (this.accepts('html', 'json')) {
      case 'html':
        yield this.renderDefaults('loo', {
            loo: loo.toJSON(),
            macromap: {
                center: loo.geometry.coordinates.slice().reverse(),
                zoom: 17
            }
        })
        break
      case 'json':
        this.status = 200
        this.body = loo
        break
    }
  },
  path: '/loos/:id',
  method: 'get'
}

module.exports = routes

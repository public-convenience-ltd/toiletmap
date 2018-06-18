'use strict'

var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var config = require('../../config/config')
var routes = {}

routes.nearby_loos = {
  handler: function*() {
    var maxDistance = this.query.radius || config.query_defaults.maxDistance
    var limit = this.query.limit || config.query_defaults.limit
    var loos = yield Loo.findNear(this.params.lon, this.params.lat, maxDistance, limit)
            .exec()
    this.status = 200
    this.body = new LooList(loos) 
  },
  path: '/loos/near/:lon/:lat',
  method: 'get'
}

routes.loos_in = {
  handler: function*() {
    var loos = yield Loo.findIn(this.params.sw, this.params.ne, this.params.nw, this.params.se)
            .exec()
    this.status = 200
    this.body = new LooList(loos)
  },
  path: '/loos/in/:sw/:ne/:nw/:se',
  method: 'get'
}

routes.loos_ids = {
  handler: function*() {
    var q = {}
    if (this.query.missing) {
      q[this.query.missing] = { $exists: false }
    }
    var loos = yield Loo.findIds(q)
            .exec()
    this.status = 200
    this.body = new LooList(loos)
  },
  path: '/loos',
  method: 'get'
}

routes.loos_updateArea = {
  handler: function*() {
    var loo = yield Loo.findById(this.params.id)
    // var updatedLoo = yield loo.updateArea()
    var regen = yield loo.regenerate()
    yield regen.save()
    this.status = 200
    this.body = regen
  },
  path: '/loos/:id/updateArea',
  method: 'get'
}

routes.loo = {
  handler: function*() {
    var loo = yield Loo.findById(this.params.id)
            .exec()
    if (!loo) {
      return
    }

    this.status = 200
    this.body = loo
  },
  path: '/loos/:id',
  method: 'get'
}

module.exports = routes

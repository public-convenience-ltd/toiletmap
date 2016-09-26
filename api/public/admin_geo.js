'use strict'

var Loo = require('../../models/loo')
var routes = {}
var _ = require('lodash')

routes.admin_geo = {

  handler: function*() {
    // gets list of area lists
    var data = yield Loo.aggregate([
      {
        $match: { 'properties.area': { $exists: true } }
      },
      {
        $unwind: '$properties.area'
      },
      {
        $group: {
          _id: '$properties.area.type',
          areaNames: {
            $addToSet: '$properties.area.name'
          }
        }
      }
    ])
    var body = _.reduce(data, function (acc, d) {
      acc[d._id] = d.areaNames
      return acc
    }, {})
    this.status = 200
    this.body = yield body
  },
  path: '/admin_geo/areas',
  method: 'get'
}

module.exports = routes

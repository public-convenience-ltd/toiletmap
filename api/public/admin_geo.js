'use strict'

var Loo = require('../../models/loo')
var routes = {}

routes.admin_geo = {

  handler: function*() {
    // gets list of area lists
    var test = Loo.schema.eachPath(function (path) {
      return path
    })
    var areaTypes = Object.keys(test.tree.properties.area)
    areaTypes.unshift('All')
    var body = {
      'areaTypes': areaTypes,
      data: {}
    }

    var allList = []
    for (var i = 0; i < areaTypes.length; i++) {
      var query = 'properties.area.' + areaTypes[i]
      var areaList = yield Loo.distinct(query)
      if (areaList.length > 0) {
        areaList = areaList.sort()
        allList = allList.concat(areaList)
        areaList.unshift('All')
        body.data[areaTypes[i]] = areaList
      } else {
        body.data[areaTypes[i]] = ['All']
      }
    }
    allList = allList.sort()
    allList.unshift('All')
    body.data['All'] = allList

    this.status = 200
    this.body = yield body
  },
  path: '/admin_geo/areas',
  method: 'get'
}

module.exports = routes

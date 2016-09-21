'use strict'

var Loo = require('../../models/loo')
var _ = require('lodash')
var routes = {}

routes.search = {
  handler: function * () {
    var params = Object.assign({}, this.query)
    var loos = []
    var query = {}
    // Strip out the pagination we use
    var limit = params.limit || 10
    var page = params.page || 1
    delete params.limit
    delete params.page

    if (params.searchTerm) {
      query.$or = [
          {'properties.name': new RegExp('.*' + this.query.searchTerm + '.*', 'i')},
          {'properties.notes': new RegExp('.*' + this.query.searchTerm + '.*', 'i')}
      ]
    }
    delete params.searchTerm

    _.each(params, function (val, name) {
      query.$and = query.$and || []
      query.$and.push({
        ['properties.' + name]: val
      })
    })

    loos = yield Loo.paginate(query, {page: page, limit: limit})

    this.status = 200
    this.body = loos
  },
  path: '/search',
  method: 'get'
}

module.exports = routes

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

    if (params.text) {
      query.$or = [
          {'properties.name': new RegExp('.*' + this.query.text + '.*', 'i')},
          {'properties.notes': new RegExp('.*' + this.query.text + '.*', 'i')}
      ]
    }
    delete params.text

    // Handle text searches
    _.each(params, function (val, name) {
      query.$and = query.$and || []
      if (/^text_/.test(name)) {
        query.$and.push({
          ['properties.' + name.replace('text_', '')]: new RegExp('.*' + val + '.*', 'i')
        })
        delete params[name]
      }
    })

    // Handle queries for missing fields
    _.each(params, function (val, name) {
      query.$and = query.$and || []
      if (/^emptylist_/.test(name)) {
        query.$and.push({
          ['properties.' + name.replace('emptylist_', '')]: { '$size': 0 }
        })
        delete params[name]
      }
    })

    // Handle all remaining params
    _.each(params, function (val, name) {
      query.$and = query.$and || []
      query.$and.push({
        ['properties.' + name.replace('_', '.')]: val
      })
      delete params[name]
    })

    loos = yield Loo.paginate(query, {page: page, limit: limit})

    this.status = 200
    this.body = loos
  },
  path: '/search',
  method: 'get'
}

module.exports = routes

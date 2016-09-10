'use strict'

var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var routes = {}

routes.search = {
  handler: function * () {
    var loos = []
    var anySynonyms = ['Any', 'either', 'All']
    var propertyBlacklist = ['area', 'notes']
    if (this.query.searchTerm) {
      loos = yield Loo.find({
        'properties.name': new RegExp('.*' + this.query.searchTerm + '.*', 'i')
      })
                .exec()
    } else {
      if (Object.keys(this.query)
                .length !== 0) {
        var query = {}

        if (this.query.area) {
          if (this.query.area !== 'All') {
            query['$or'] = [{
              'properties.area.District council': this.query.area
            }, {
              'properties.area.Unitary Authority': this.query.area
            }, {
              'properties.area.Metropolitan district': this.query.area
            }, {
              'properties.area.London borough': this.query.area
            }]
          }
        }

        if (this.query.notes) {
          if (this.query.notes !== 'either') {
            if (this.query.notes === 'true') {
              query['properties.notes'] = {
                '$exists': true
              }
            } else if (this.query.notes === 'false') {
              query['properties.notes'] = {
                '$exists': false
              }
            }
          }
        }

        for (var property in this.query) {
          if (propertyBlacklist.indexOf(property) < 0) {
            if (anySynonyms.indexOf(this.query[property]) < 0) {
              query['properties.' + property] = this.query[property]
            }
          }
        }

        loos = yield Loo.find(query)
                    .exec()
      }
    }

    this.status = 200
    this.body = new LooList(loos)
  },
  path: '/search',
  method: 'get'
}

module.exports = routes

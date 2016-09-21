'use strict'

var Loo = require('../../models/loo')
var LooReport = require('../../models/loo_report')
var _ = require('lodash')
var moment = require('moment')
var routes = {}

var scopeQuery = function (query, options) {
  var start = options.start ? moment(options.start) : moment('2009-01-01')
  var end = options.end ? moment(options.end) : moment()
  var area = options.area || 'All'
  var areaType = options.areaType || 'All'
  query['$and'] = [{
    'createdAt': {
      '$gte': start.toDate()
    }
  }, {
    'createdAt': {
      '$lte': end.toDate()
    }
  }]

  if (areaType !== 'All') {
    query.$and.push({'properties.area.type': areaType})
  }

  if (area !== 'All') {
    query.$and.push({'properties.area.name': area})
  }

  return query
}

routes.counters = {

  handler: function*() {
    var counts = yield {
      activeLoos: Loo.count(scopeQuery({'properties.active': 'true'}, this.query)).exec(),
      loosCount: Loo.count(scopeQuery({}, this.query)).exec(),
      looReports: LooReport.count(scopeQuery({}, this.query)).exec(),
      uiReports: LooReport.count(scopeQuery({'collectionMethod': 'api'}, this.query)).exec(),
      removals: LooReport.count(scopeQuery({'properties.removal_reason': { $exists: true }}, this.query)).exec(),
      multiReportLoos: Loo.count(scopeQuery({'reports.1': { $exists: true }}, this.query)).exec()
    }
    counts.importedReports = counts.looReports - counts.uiReports
    counts.inactiveLoos = counts.loosCount - counts.activeLoos

    this.status = 200

    this.body = yield {
      'Total Toilets Added': counts.loosCount,
      'Active Toilets Added': counts.activeLoos,
      'Inactive/Removed Toilets': counts.inactiveLoos,
      'Total Loo Reports Recorded': counts.looReports,
      'Total Reports via Web UI/API': counts.uiReports,
      'Reports from Data Collections': counts.importedReports,
      'Removal Reports Submitted': counts.removals,
      'Loos with Multiple Reports': counts.multiReportLoos
    }
  },
  path: '/statistics/counters',
  method: 'get'
}

routes.proportions = {

  handler: function*() {
    // used for percentages
    var data = yield {
      publicLoos: Loo.count(scopeQuery({'properties.access': 'public'}, this.query)).exec(),
      unknownAccessLoos: Loo.count(scopeQuery({'properties.access': 'none'}, this.query)).exec(),
      babyChange: Loo.count(scopeQuery({'properties.babyChange': 'true'}, this.query)).exec(),
      babyChangeUnknown: Loo.count(scopeQuery({'properties.babyChange': 'Not Known'}, this.query)).exec(),
      activeLoos: Loo.count(scopeQuery({'properties.active': 'true'}, this.query)).exec(),
      accessibleLoos: Loo.count(scopeQuery({
        '$or': [
           {'properties.accessibleType': 'unisex'},
           {'properties.accessibleType': 'male and female'}
        ]
      }, this.query)).exec(),
      accessibleLoosUnknown: Loo.count(scopeQuery({
        '$or': [
           {'properties.accessibleType': null},
           {'properties.accessibleType': ''}]
      }, this.query)).exec(),
      loosCount: Loo.count(scopeQuery({}, this.query)).exec()
    }

    this.status = 200

    this.body = yield {
      'Active Loos': [data.activeLoos, data.loosCount - data.activeLoos, 0],
      'Public Loos': [data.publicLoos, data.loosCount - (data.publicLoos + data.unknownAccessLoos), data.unknownAccessLoos],
      'Baby Changing': [data.babyChange, data.loosCount - (data.babyChange + data.babyChangeUnknown), data.babyChangeUnknown],
      'Accessible Loos': [data.accessibleLoos, data.loosCount - (data.accessibleLoos + data.accessibleLoosUnknown), data.accessibleLoosUnknown]
    }
  },
  path: '/statistics/proportions',
  method: 'get'
}

routes.contributors = {

  handler: function*() {
    var scope = scopeQuery({}, this.query)
    scope.$and.push({type: 'Feature'})
    var contributors = yield LooReport.aggregate([
      {
        $match: scope
      },
      {
        $group: {
          _id: '$attribution',
          reports: {
            $sum: 1
          }
        }
      }]).exec()

    this.status = 200
    this.body = yield _.transform(contributors, function (acc, val) {
      acc[val._id] = val.reports
    }, {})
  },
  path: '/statistics/contributors',
  method: 'get'
}

routes.areas = {

  handler: function*() {
    var scope = scopeQuery({}, this.query)
    scope.$and.push({type: 'Feature'})
    var areas = yield Loo.aggregate([
      {
        $match: scope
      },
      {
        $project: {
          'areaType': {
            $cond: ['$properties.area.type', '$properties.area.type', 'Unknown Type']
          },
          'areaName': {
            $cond: ['$properties.area.name', '$properties.area.name', 'Unknown Area']
          },
          'active': {
            $cond: [ '$properties.active', 1, 0 ]
          },
          'babyChange': {
            $cond: [{ $eq: ['$properties.babyChange', 'true'] }, 1, 0]
          }
        }
      },
      {
        $group: {
          _id: '$areaName',
          'looCount': {
            $sum: 1
          },
          'activeLooCount': {
            $sum: '$active'
          },
          'babyChangeCount': {
            $sum: '$babyChange'
          }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]).exec()

    this.status = 200
    this.body = areas
  },
  path: '/statistics/areas',
  method: 'get'
}

module.exports = routes

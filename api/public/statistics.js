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
  var includeInactive = options.includeInactive || false
  query['$and'] = [{
    'createdAt': {
      '$gte': start.toDate()
    }
  }, {
    'createdAt': {
      '$lte': end.toDate()
    }
  }]

  if (!includeInactive) {
    query.$and.push({'properties.active': true})
  }

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
    var qWithInactive = _.merge({includeInactive: true}, this.query)
    var counts = yield {
      activeLoos: Loo.count(scopeQuery({}, this.query)).exec(),
      loosCount: Loo.count(scopeQuery({}, qWithInactive)).exec(),
      looReports: LooReport.count(scopeQuery({}, qWithInactive)).exec(),
      uiReports: LooReport.count(scopeQuery({'collectionMethod': 'api'}, qWithInactive)).exec(),
      removals: LooReport.count(scopeQuery({'properties.removal_reason': { $exists: true }}, qWithInactive)).exec(),
      multiReportLoos: Loo.count(scopeQuery({'reports.1': { $exists: true }}, qWithInactive)).exec()
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
      activeLoos: Loo.count(scopeQuery({}, this.query)).exec(),
      inaccessibleLoos: Loo.count(scopeQuery({
        'properties.accessibleType': 'none'
      }, this.query)).exec(),
      accessibleLoosUnknown: Loo.count(scopeQuery({
        'properties.accessibleType': {$exists: false}
      }, this.query)).exec(),
      loosCount: Loo.count(scopeQuery({}, this.query)).exec(),
      inactiveLoos: Loo.count(scopeQuery({}, _.merge({includeInactive: true}, this.query)))
    }

    this.status = 200

    this.body = yield {
      'Active Loos': [data.activeLoos, data.inactiveLoos - data.activeLoos, 0],
      'Public Loos': [data.publicLoos, data.loosCount - (data.publicLoos + data.unknownAccessLoos), data.unknownAccessLoos],
      'Baby Changing': [data.babyChange, data.loosCount - (data.babyChange + data.babyChangeUnknown), data.babyChangeUnknown],
      'Accessible Loos': [data.loosCount - (data.inaccessibleLoos + data.accessibleLoosUnknown), data.inaccessibleLoos, data.accessibleLoosUnknown]
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
    var scope = scopeQuery({}, _.merge({includeInactive: true}, this.query))
    var areas = yield Loo.aggregate([
      {
        $match: scope
      },
      {
        $unwind: '$properties.area'
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
          'public': {
            $cond: [
              {
                $eq: ['$properties.access', 'public']
              },
              1, 0]
          },
          'permissive': {
            $cond: [
              {
                $eq: ['$properties.access', 'permissive']
              },
              1, 0]
          },
          'babyChange': {
            $cond: [
              {
                $and: [
                  { $eq: ['$properties.babyChange', 'true'] },
                  { $eq: ['$properties.active', true] }
                ]
              },
              1, 0]
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
          'publicLooCount': {
            $sum: '$public'
          },
          'permissiveLooCount': {
            $sum: '$permissive'
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

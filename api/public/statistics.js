'use strict'

var Loo = require('../../models/loo')
var LooReport = require('../../models/loo_report')
var _ = require('lodash')
var routes = {}

routes.statistics = {
  handler: function * () {
    var loosCount = yield Loo.count().exec()
    var activeLoos = yield Loo.count({'properties.active': true}).exec()
    var looReports = yield LooReport.count().exec()
    var uiReports = yield LooReport.count({'collectionMethod': 'api'}).exec()
    var importedReports = looReports - uiReports
    var removals = yield LooReport.count({'properties.removal_reason': {$exists: true}}).exec()
    var contributors = yield LooReport.aggregate([
      { $match: {'type': 'Feature' } },
        {
          $group: {
            _id: '$attribution',
            reports: { $sum: 1 }
          }
        }
      ]).exec()
    var multi_report_loos = yield Loo.count({'reports.1': {$exists: true}}).exec()

    this.status = 200
    this.body = yield {
        'Total Toilets Recorded': loosCount,
        'Toilets Active on Map': activeLoos,
        'Inactive/Removed Toilets': loosCount - activeLoos,
        'Total Loo Reports Recorded': looReports,
        'Total Reports via Web UI/API': uiReports,
        'Reports from Data Collections': importedReports,
        'Toilet Removal Reports': removals,
        'Count reports by Attribution': _.transform(contributors, function (acc, val) {
          acc[val._id] = val.reports
        }, {}),
        'Loos with more than one report (dedupes + edits)': multi_report_loos
    }
  },
  path: '/statistics',
  method: 'get'
}

module.exports = routes

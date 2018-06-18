var LooReport = require('../../models/loo_report')
var Loo = require('../../models/loo')
var LooList = require('../../models/loo_list')
var routes = {}

routes.reports = {
  handler: function * () {
    var reports = yield LooReport.find().exec()
    this.status = 200
    this.body = new LooList(reports)
  },
  path: '/reports',
  method: 'get'
}

routes.report = {
  handler: function * () {
    var id = this.params.id.replace('.json', '')
    var report = yield LooReport.findById(id).exec()
    if (!report) {
      this.throw(404)
    }
    this.status = 200
    this.body = report
  },
  path: '/reports/:id',
  method: 'get'
}

module.exports = routes

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
    var report = yield LooReport.findById(this.params.id).exec()
    if (!report) {
      this.throw(404)
    }
    this.status = 200
    this.body = report
  },
  path: '/reports/:id',
  method: 'get'
}

routes.report_form = {
  handler: function * () {
    var loo
    var macromap

 

    if (this.request.query.base) {
      loo = yield Loo.findById(this.request.query.base).exec()
    }

    macromap = {
      zoom: 18,
      locate: loo ? false : true
    }

    if (loo) {
      macromap.center = loo.geometry.coordinates.slice().reverse()
    }

	
    yield this.renderDefaults('edit', {
      loo: loo,
      edit:"edit",
      macromap: macromap
    })
  },
  path: '/report',
  method: 'get'
}

routes.removal_form = {
  handler: function * () {
    var loo = yield Loo.findById(this.params.id).exec()
    if (!loo) {
      this.throw(404)
    }
    yield this.renderDefaults('remove', {
      loo: loo,
      macromap: {
        center: loo.geometry.coordinates.slice().reverse(),
        zoom: 17
      }
    })
  },
  path: '/remove/:id',
  method: 'get'
}

module.exports = routes

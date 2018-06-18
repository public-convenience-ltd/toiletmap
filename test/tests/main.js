/* global describe, before, after */
var config = require('../../config/config')
var app = require('../../app')
var Promise = require('bluebird')
var co = require('co')

function importTest (name, path) {
  describe(name, function () {
    require(path)
  })
}

describe('start testing', function () {
  describe('standard mode', function () {
    before(function (done) {
      co(function * () {
        yield app.init(config)
        done()
      })
    })
      // tear it down after
    after(function (done) {
      app.server.tclose = Promise.promisify(app.server.close, {context: app.server})
      co(function * () {
        yield app.server.tclose()
      }).then(done)
    })



    // public api
    importTest('End points in loo.js', './loos.js')
    importTest('Statistics', './statistics.js')
    importTest('reports.js', './reports.js')
  })
})

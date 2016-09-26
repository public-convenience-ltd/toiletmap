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

        // ui //currently doesnt work
    importTest('Test ui handlers', './ui.js')

        // public api
    importTest('End points in loo.js', './loos.js')
    importTest('Simple pages', './simple_pages.js')
    importTest('Sign in and out', './signin.js')
    importTest('Statistics', './statistics.js')
    importTest('reports.js', './reports.js')
    importTest('Stand alone map', './standaloneMap.js')

        // private api
    importTest('auth', './auth.js')
    importTest('Loo reports private', './looReportsPrivate.js')
  })

    // currently doesnt work because read only mode isn't set as true
  describe('start testing in readonly mode', function () {
    before(function (done) {
      co(function * () {
        yield app.init(config)
        done()
      })
    })
      // tear it down after
    after(function (done) {
      co(function * () {
        config.app.readonly =
          yield Promise.promisify(app.server.close, {context: app.server})
      }).then(done)
    })
        // importTest('basic readonly test', './readonly.js')
  })
})

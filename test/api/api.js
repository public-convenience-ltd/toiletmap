/* global describe, before, after, it */
var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var app = require('../../app')
var thunk = require('thunkify')
var co = require('co')
var supertest = require('supertest')
var request = supertest(baseUrl)
var _ = require('lodash')
var fakery = require('../fixtures')
var Loo = require('../../models/loo')

Loo.remove = thunk(Loo.remove)

describe('Loos service', function () {
  // Bring up a server before testing
  before(function (done) {
    co(function * () {
      yield app.init()
      // Add 12 fake loos
      yield _.map(_.range(12), function () {
        return fakery.makeAndSave('loo')
      })
    }).then(done)
  })
  // tear it down after
  after(function (done) {
    app.server.tclose = thunk(app.server.close)
    co(function * () {
      yield app.server.tclose()
      yield Loo.remove({})
    }).then(done)
  })

  it('/loos should return an array of loos', function (done) {
    request
    .get('/loos')
    .expect(200)
    .expect('Total-Count', '12')
    .end(done)
  })
})

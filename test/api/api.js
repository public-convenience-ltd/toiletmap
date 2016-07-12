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
  

  it('/loos/in/:sw/:ne/:nw/:se should return an array of loos', function (done) {
    request
    .get('/loos/in/-24.2,44.5/20.3,60.4/-24.2,60.4/20.3,44.5')
    .set('Accept', 'application/json')
    .expect(200)
    .expect(function (res) {
      if (!(res.body.features.length === 12)) {
        return 'Not enough Loos'
      }
    })
    .end(done)
  });

  it('loos/near/:lon/:lat should return an array of loos', function (done) {
    request
    .get('/loos/near/-22.2/52.5')
    .set('Accept', 'application/json')
    .expect(200)
    .expect(function (res) {
      if (!(res.body.features.length === 0)) {
        return 'Not enough Loos'
      }
    })
    .end(done)
  });
})

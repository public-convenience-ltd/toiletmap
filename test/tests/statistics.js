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
var LooReport = require('../../models/loo_report')
var mongoose = require('mongoose');






  before(function (done) {
    co(function * () {

       inactiveLoos = _.map(_.range(5), function () {
	return fakery.makeAndSave('looBox',{properties: { access: 'public', active: false }})
	})
	

       normalLoos = _.map(_.range(5), function () {
	return fakery.makeAndSave('looBox',{properties: { access: 'public', active: true }})
      })

      duplicateLoos = _.map(_.range(5), function () {
	return fakery.makeAndSave('looBox',{reports: [mongoose.Types.ObjectId(),mongoose.Types.ObjectId()], properties: { access: 'public', active: true }})
      })

     yield inactiveLoos.concat(normalLoos).concat(duplicateLoos)
     

    }).then(done)
  })
  after(function (done) {
    co(function * () {
      yield Loo.remove({})
    }).then(done)
  })
  

  it('check response code', function (done) {
    request
    .get('/statistics')
    .set('Accept', 'text/html')
    .expect(200)
    .end(done)
  })
  it('check Total Toilets recorded', function (done) {
    request
    .get('/statistics')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body['Total Toilets Recorded'] === 15)) {
	return 'Total Toilets incorrect'
      }
    })
    .end(done)
  })
  it('check inactive Toilets recorded', function (done) {
    request
    .get('/statistics')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body['Inactive/Removed Toilets'] === 5)) {
	return 'Inactive toilets incorrect'
      }
    })
    .end(done)
  })

  it('Check number of duplicate loos', function (done) {
    request
    .get('/statistics')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body['Loos with more than one report (dedupes + edits)'] === 5)) {
	return 'number of duplicate loos are wrong'
      }
    })
    .end(done)
  })




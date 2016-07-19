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
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');

 before(function (done) {
 	done();
 })
  after(function (done) {
	done();
  })

  it('Basic map test', function (done) {
    request
    .get('/map/0/0')
    .set('Accept', 'text/html')
    .expect(function (res) {
	//console.log(res);
    })
    .end(done)
  })




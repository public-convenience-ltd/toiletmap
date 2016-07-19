var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var supertest = require('supertest');
var request = supertest(baseUrl);
var fakery = require('../fixtures');
var co = require('co');
var LooReport = require('../../models/loo_report')
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');


 var enteredData;
 before(function (done) {
	loader(LooReport,"looReportsAll",function(err,result){
		if(err){console.log(err)};
		enteredData = result;
		done();
		return result

	});
 })
  after(function (done) {
    co(function * () {
      yield LooReport.remove({})
    }).then(done)
  })

  it('check response code', function (done) {
    request
    .get('/reports')
    .set('Accept', 'application/json')
    .expect(200)
    .end(done)
  })
  it('check reports data', function (done) {
    request
    .get('/reports')
    .set('Accept', 'application/json')
    .expect(function (res) {
	if(res.body.features.length != enteredData.insertedCount){
		return "incorrect amount of loo reports"
	}
    })
    .end(done)
  })
  it('get report by ID', function (done) {
    request
    .get('/reports/' + enteredData.ops[0]._id.toString())
    .set('Accept', 'application/json')
    .expect(function (res) {
	if(res.body._id.toString() != enteredData.ops[0]._id.toString()){
		return "returned wrong id"
	}
    })
    .end(done)
  })
  it('Test for non-existant Id', function (done) {
    var newId = new mongoose.mongo.ObjectId().toString()
    request
    .get('/reports/' + newId)
    .expect(404)
    .set('Accept', 'application/json')
    .end(done)
  })






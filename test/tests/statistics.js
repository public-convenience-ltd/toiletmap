var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var app = require('../../app')
var thunk = require('thunkify')
var co = require('co')
var supertest = require('supertest')
var request = supertest(baseUrl)
var _ = require('lodash')
var Loo = require('../../models/loo')
var LooReport = require('../../models/loo_report')
var mongoose = require('mongoose');
var loader = require('../loader.js').dataLoader;
var async = require('async');

  before(function (done) {
	async.parallel([
	    function(callback){
		loader(Loo,"statisticsLoos",function(err,result){
			if(err){console.log(err)};
			enteredData = result;
			callback(null, result);
			return result

		});
	    },
	    function(callback){
		loader(LooReport,"looReportsAll",function(err,result){
			if(err){console.log(err)};
			enteredData = result;
			callback(null, result);
			return result

		});
	    }
	],
	function(err, results) {
	     done();
	});





  })
  after(function (done) {
    co(function * () {
      yield LooReport.remove({})
      yield Loo.remove({})
    }).then(done)
  })


  it('check response code', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(200)
    .end(done)
  })
  it('check Total Toilets recorded', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Total Toilets Added'] === 50)) {
	return 'Total Toilets incorrect'
      }
    })
    .end(done)
  })

  it('check active Toilets recorded', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Active Toilets Added'] === 48)) {
	return 'Active toilets incorrect'
      }
    })
    .end(done)
  })

  it('check inactive Toilets recorded', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Inactive/Removed Toilets'] === 2)) {
	return 'Inactive toilets incorrect'
      }
    })
    .end(done)
  })

  it('total loo reports', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Total Loo Reports Recorded'] === 5)) {
	return 'Total loo reports recorded incorrect'
      }
    })
    .end(done)
  })

  it('Reports from Web UI/API', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Total Reports via Web UI/API'] === 2)) {
	return 'reports recorded from web UI incorrect'
      }
    })
    .end(done)
  })

  it('Reports from Data Collections', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Reports from Data Collections'] === 3)) {
	return 'reports recorded from data collections incorrect'
      }
    })
    .end(done)
  })

  it('Number of removal reports', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Removal Reports Submitted'] === 2)) {
	return 'number of removal reports incorrect'
      }
    })
    .end(done)
  })

  it('Count reports by Attribution', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body['Count reports by Attribution']['Brighton & Hove City Council'] === 5 )) {
	return 'count reports by attribution incorrect'
      }
    })
    .end(done)
  })



  it('Check number of duplicate loos', function (done) {
    request
    .get('/statistics?timescale=Overall')
    .set('Accept', 'text/html')
    .expect(function (res) {
      if (!(res.body.numbers['Loos with Multiple Reports'] === 5)) {
	return 'number of duplicate loos are wrong'
      }
    })
    .end(done)
  })

//TODO
//Needs extension due to all the new statistics being implemented

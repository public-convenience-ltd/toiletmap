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
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');


describe('A test to trigger handlers', function () {

var looGlobal = null;
before(function (done) {
	loader(Loo,"looEmpty",function(err,result){
		if(err){console.log(err)};
		looGlobal = result.ops[0];
		done();
		return result

	});
})

  // tear it dewn after
  after(function (done) {
    co(function * () {
      yield Loo.remove({})
    }).then(done)
  })
  
  it('/loos/:id JSON', function (done) {
    stringID = looGlobal._id.toString();
    request
    .get('/loos/'+stringID)
    .set('Accept', 'application/json')
    .expect(200)
    .expect(function (res) {
      if (!(res.body)) {
	return 'Not enough Loos'
      }
    })
    .end(done)
  });
})

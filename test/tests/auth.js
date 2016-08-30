var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var supertest = require('supertest');
var superagent = require('superagent');
var request = supertest(baseUrl);
var co = require('co');
var LooReport = require('../../models/loo_report')
var Loo = require('../../models/loo')
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');
var async = require('async');
var superagent = require('superagent');
var request2 = require('request');
request2 = request2.defaults({jar: true}) //enable cookies
var agent = superagent.agent();
var chai = require('chai');
var expect = chai.expect;

//***NB*** Supertest does not play well with the auth requested so for this file I'm mostly using the request module



 before(function (done) {
	done()

 })

  after(function (done) {


    co(function * () {
      yield LooReport.remove({})
      yield Loo.remove({})

    }).then(done)
  })

it('login with wrong info',function(done){

request2
  .get(baseUrl+'/auth/admin?redirect=/', {
  'auth': {
    'user': "wibble",
    'pass': config.auth.local.password,
    'sendImmediately': false
  }
})
 .on('response', function(response) {
    expect(response.statusCode).to.equal(401);
    done()
  })

});



it('login with redirect',function(done){

request2
  .get(baseUrl+'/auth/admin?redirect=/', {
  'auth': {
    'user': config.auth.local.username,
    'pass': config.auth.local.password,
    'sendImmediately': false
  }
})
 .on('response', function(response) {
    expect(response.statusCode).to.equal(200);
    done()
  })

});


it('signout',function(done){
	request2
	  .get(baseUrl+'/signout', {
	})
	 .on('response', function(response) {
	    expect(response.statusCode).to.equal(200);
	    done()
	  })
});












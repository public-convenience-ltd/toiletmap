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
var j = request2.jar()



var cookieList;
 before(function (done) {
	async.parallel([
	    function(callback){
		loader(Loo,"statisticsLoos",function(err,result){
			if(err){console.log(err)};
			enteredDataLoos = result;
			callback(null, result);
			return result

		});
	    },
	    function(callback){
		loader(LooReport,"looReportsAll",function(err,result){
			if(err){console.log(err)};
			enteredDataReports = result;
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



//supertest's auth doesnt deal with digest, so having to use "request" module
it('basic login with redirect',function(done){

request2
  .get(baseUrl+'/auth/admin', {
  'auth': {
    'user': config.auth.local.username,
    'pass': config.auth.local.password,
    'sendImmediately': false
  },
  jar:j
})
 .on('response', function(response) {
    agent.saveCookies(response)
    expect(response.statusCode).to.equal(200);
    done()
  })
});


//cookies not working
it('An attempted removal ',function(done){
	stringID = enteredDataLoos.ops[0]._id.toString();
	req = request.post('/remove/'+stringID)
	.set('Content-Type',"application/json")
	//agent.attachCookies( req )
	req.redirects(1);
	req.expect(200)
	.expect(function(res){
		console.log(res)
	})
	.end(done)
});







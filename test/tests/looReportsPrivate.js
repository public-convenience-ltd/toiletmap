var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var supertest = require('supertest');
var request = supertest(baseUrl);
var co = require('co');
var LooReport = require('../../models/loo_report')
var Loo = require('../../models/loo')
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');
var async = require('async');
var superagent = require('superagent');
var request2 = require('request');
var agent = superagent.agent();


var improvedHeader;

 var enteredData;
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

var theAccount = {
	user: 'test',
	password: 'test'
}



//supertest's auth doesnt deal with digest, so having to use "request module"
it('basic login with redirect',function(done){
globalDone = done;
request2.get(baseUrl+'/auth/admin', {
  'auth': {
    'user': 'test',
    'pass': 'test',
    'sendImmediately': false
  }
})
 .on('response', function(response) {
    if (response.statusCode === 200){
    	globalDone();
    }else{
    	throw "Expected 200, returned:"+response.statusCode;
    }
  })



});




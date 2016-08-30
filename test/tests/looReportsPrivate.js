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


it('removal with genuine loo',function(done){
var stringID = enteredDataLoos.ops[0]._id.toString()

request2({
    headers: {
      'Content-Type': 'application/json'
    },
    uri: baseUrl+'/remove/'+stringID,
    method: 'POST',
    followAllRedirects: true
  }, function (err, res, body) {
	expect(res.statusCode).to.equal(200)
        done()
  });

});



it('add report with a dataString',function(done){
	var headers = {
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Accept': 'text/html',
	};

	var dataString = 'geometry.type=Point&properties.name=no+name&properties.access=public&properties.type=female&properties.accessibleType=female&properties.opening=24/7&properties.attended=true&properties.babyChange=false&properties.automatic=true&properties.radar=&properties.fee=0.10&properties.notes=No+Notes&geometry.coordinates.0=1.292719100000017&geometry.coordinates.1=52.63696673342568&origin=Great+British+Public+Toilet+Map';

	var options = {
	    url: baseUrl + '/reports',
	    method: 'POST',
	    headers: headers,
	    body: dataString,
	    followAllRedirects: true
	};

	request2(options, function(error,response,body){
		expect(response.statusCode).to.equal(200)
		expect(body).to.contain('Credibility');
		expect(body).to.contain('Sources');
		expect(body).to.contain('Contributors');
		done()
	})

});

it('add report with json',function(done){
    var headers =  {
      'Content-Type': 'application/json'
    }

   var data =
	 {'geometry':
		{'type':'Point',
	  	 'coordinates':["1.292719100000017","52.63696673342568"]
		},
	   'properties':{
		'name':"Name",
		'access': "public",
		'type': "female",
		'accessibleType': "female",
		'opening':"24/7",
		'attended':"true",
		'babyChange':"false",
		'automatic': "true",
		'radar': "",
		'fee': "0.10",
		'notes':"No+notes"
	    },
	'origin':'Great+British+Public+Toilet+Map'
	}

	var options = {
	    url: baseUrl + '/reports',
	    method: 'POST',
	    json: data,
	    followAllRedirects: true
	};



	request2(options, function(error,response,body){
		expect(body).to.contain('Created');
		expect(response.statusCode).to.equal(201)
		done()
	})

});

it('add report of neither json or form, should error',function(done){
    var headers =  {
      'Content-Type': 'text/html'
	}

   var data ="wibble";
	var options = {
	    url: baseUrl + '/reports',
	    method: 'POST',
	    headers:headers,
	    json: data,
	    followAllRedirects: true
	};



	request2(options, function(error,response,body){
		expect(response.statusCode).to.equal(404)
		done()
	})

});
//TODO unhappy with the detail in this, but its because the api doesn't return much information when this breaks
it('add report malformed',function(done){
    var headers =  {
      'Content-Type': 'application/json'
    }

   var data =
	 {'geometry':"something",
	   'notproperties':{
		'name':"Name",
		'access': "public",
		'type': "female",
		'accessibleType': "female",
		'opening':"24/7",
		'attended':"true",
		'babyChange':"false",
		'automatic': "true",
		'radar': "",
		'fee': "0.10",
		'notes':"No+notes"
	    },
	'origin':'Great+British+Public+Toilet+Map'
	}

	var options = {
	    url: baseUrl + '/reports',
	    method: 'POST',
	    json: data,
	    followAllRedirects: true
	};



	request2(options, function(error,response,body){
		expect(response.statusCode).to.equal(500)
		done()
	})

});







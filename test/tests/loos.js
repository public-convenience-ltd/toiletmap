
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
var LooReport = require('../../models/loo_report')
var loader = require('../loader.js').dataLoader;
var mongoose = require('mongoose');

describe('Find loos within a box (/loos/in)', function () {
  before(function (done) {
    co(function * () {
      // Add 12 fake loos
      yield _.map(_.range(12), function () {
	result =  fakery.makeAndSave('looBox');
	return result
      })
    }).then(done)
  })
  after(function (done) {
    co(function * () {
      yield Loo.remove({})
    }).then(done)
  })
  

  it('/loos/in/:sw/:ne/:nw/:se', function (done) {
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

})




describe('Find loos within radius (/loos/near)', function () {
  // Bring up a server before testing
  before(function (done) {
    co(function * () {
      yield _.map(_.range(5), function () {
	result =  fakery.makeAndSave('looCircle');

	return result
      })
    }).then(done)
  })
  // tear it down after
  after(function (done) {
    co(function * () {
      yield Loo.remove({})
    }).then(done)
  })
  
  //TODO test needs fixing, currently a placeholder
  it('/loos/near/:lon/:lat JSON', function (done) {
    request
    .get('/loos/near/0/0')
    .set('Accept', 'application/json')
    .expect(200)
    .expect(function (res) {
      if (!(res.body.features.length === 5)) {
	return 'Not enough Loos'
      }
    })
    .end(done)
  });

  it('/loos/near/:lon/:lat HTML', function (done) {
    request
    .get('/loos/near/0/0')
    .set('Accept', 'text/html')
    .expect(200)
    .end(done)
  });


})


describe('Find loos via ID ( /loos/:id/)', function () {

var looGlobal = null;
before(function (done) {
	loader(Loo,"looID",function(err,result){
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

  it('/loos/:id HTML', function (done) {
    stringID = looGlobal._id.toString();
    request
    .get('/loos/'+stringID)
    .set('Accept', 'text/html')
    .expect(200)
    .expect(function (res) {
      if (!(res.body)) {
	return 'Not enough Loos'
      }
    })
    .end(done)
  });

  it('/loos/:id With none valid ID', function (done) {
    stringID = new  mongoose.mongo.ObjectId(),
    request
    .get('/loos/'+stringID)
    .set('Accept', 'text/html')
    .expect(404)
    .expect(function (res) {
      if (!(res.body)) {
	return 'Not enough Loos'
      }
    })
    .end(done)
  });



})





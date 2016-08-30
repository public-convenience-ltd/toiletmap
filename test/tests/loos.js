
/* global describe, before, after, it */
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

describe('Find loos within a box (/loos/in)', function () {
  before(function (done) {
	loader(Loo,"looBox",function(err,result){
		if(err){console.log(err)};
		done();
		return result
	});
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
	loader(Loo,"looRadius",function(err,result){
		if(err){console.log(err)};
		done();
		return result
	});
  })
  // tear it down after
  after(function (done) {
    co(function * () {
      yield Loo.remove({})
    }).then(done)
  })
  
  it('/loos/near/:lon/:lat JSON with default limit', function (done) {
    request
    .get('/loos/near/-0.2068223/51.518342/')
    .set('Accept', 'application/json')
    .query({radius:2000})
    .expect(200)
    .expect(function (res) {
      if (!(res.body.features.length === 5)) {
	return 'Not correct amount of loos'
      }
    })
    .end(done)
  });

  it('/loos/near/:lon/:lat JSON with limit of 17', function (done) {
    request
    .get('/loos/near/-0.2068223/51.518342/?radius=2000&limit=20')
    .set('Accept', 'application/json')
    .expect(200)
    .expect(function (res) {
      if (!(res.body.features.length === 20)) {
	return 'Not correct amount of loos'
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





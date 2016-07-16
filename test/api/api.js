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



describe('start testing',function(){
  before(function (done) {
    co(function * () {
      yield app.init()
    }).then(done)
  })
  // tear it down after
  after(function (done) {
    app.server.tclose = thunk(app.server.close)
    co(function * () {
      yield app.server.tclose()
    }).then(done)
  })
	
	describe('End points in loo.js', function () {
		Loo.remove = thunk(Loo.remove)
		describe('Find in polygon', function () {
		  // Bring up a server before testing
		  before(function (done) {
		    co(function * () {
		      // Add 12 fake loos
		      yield _.map(_.range(12), function () {
			
			result =  fakery.makeAndSave('looBox');
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
		  

		  it('/loos/in/:sw/:ne/:nw/:se should return an array of loos', function (done) {
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

		describe('Find in circle', function () {
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
		  

		  it('/loos/near/:lon/:lat', function (done) {
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

		})

		describe('Find Via ID', function () {
		  // Bring up a server before testing
		  var looGlobal = null;
		  before(function (done) {
		    co(function * () {
		      //yield result = fakery.makeAndSave('looWithID');
		      yield fakery.makeAndSave('looWithID', function(err, loo) {
			looGlobal = loo;
			result = loo;
			done()
			return result
		      });
		    })
		  })
		  // tear it down after
		  after(function (done) {
		    co(function * () {
		      yield Loo.remove({})
		    }).then(done)
		  })
		  

		  it('/loos/:id', function (done) {
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
	});


	describe('End points in about.js', function () {
		describe('/about', function () {
		  it('/about', function (done) {
		    request
		    .get('/about')
		    .set('Accept', 'text/html')
		    .expect(200)
		    .end(done)
		  });

		
		})
	});

	describe('End points in preferences.js', function () {
		describe('/preferences', function () {
		  it('/preferences', function (done) {
		    request
		    .get('/preferences')
		    .set('Accept', 'text/html')
		    .expect(200)
		    .end(done)
		  });

		
		})
	});
});

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

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}




describe('start testing',function(){
  before(function (done) {
    co(function * () {
      yield app.init()
      done()
    })
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
		describe('Find loose within a box (/loos/in)', function () {
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

		describe('Find loos via ID ( /loos/:id/)', function () {

		var looGlobal = null;
		before(function (done) {
			loader("gbptm-test","looID",function(err,result){
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





	importTest('Simple pages', './simple_pages.js')

	importTest('Sign in and out', './signin.js')


	describe('Statistics', function () {
	  before(function (done) {
	    co(function * () {

	       inactiveLoos = _.map(_.range(5), function () {
 		return fakery.makeAndSave('looBox',{properties: { access: 'public', active: false }})
	     	})
		

	       normalLoos = _.map(_.range(5), function () {
 		return fakery.makeAndSave('looBox',{properties: { access: 'public', active: true }})
	      })

	      duplicateLoos = _.map(_.range(5), function () {
 		return fakery.makeAndSave('looBox',{reports: [mongoose.Types.ObjectId(),mongoose.Types.ObjectId()], properties: { access: 'public', active: true }})
	      })

	     yield inactiveLoos.concat(normalLoos).concat(duplicateLoos)

	    }).then(done)
	  })
	  after(function (done) {
	    co(function * () {
	      yield Loo.remove({})
	    }).then(done)
	  })
	  it('check response code', function (done) {
	    request
	    .get('/statistics')
	    .set('Accept', 'text/html')
	    .expect(200)
	    .end(done)
	  })
	  it('check Total Toilets recorded', function (done) {
	    request
	    .get('/statistics')
	    .set('Accept', 'text/html')
	    .expect(function (res) {
	      if (!(res.body['Total Toilets Recorded'] === 15)) {
		return 'Total Toilets incorrect'
	      }
	    })
	    .end(done)
	  })
	  it('check inactive Toilets recorded', function (done) {
	    request
	    .get('/statistics')
	    .set('Accept', 'text/html')
	    .expect(function (res) {
	      if (!(res.body['Inactive/Removed Toilets'] === 5)) {
		return 'Inactive toilets incorrect'
	      }
	    })
	    .end(done)
	  })

	  it('Check number of duplicate loos', function (done) {
	    request
	    .get('/statistics')
	    .set('Accept', 'text/html')
	    .expect(function (res) {
	      if (!(res.body['Loos with more than one report (dedupes + edits)'] === 5)) {
		return 'number of duplicate loos are wrong'
	      }
	    })
	    .end(done)
	  })


	});















	describe('reports.js', function () {
	  before(function (done) {
	    co(function * () {
	      yield fakery.makeAndSave('LooReport', function(err, loo) {
		if (err){
		    console.log(err)
		}
		done()
		return loo
	      })
		
             })
          })
	  after(function (done) {
	    co(function * () {
	
	      yield LooReport.remove({})
	    }).then(done)
	  })

	  it('/reports', function (done) {
	    request
	    .get('/reports')
	    .set('Accept', 'text/html')
	    .expect(200)
	    .expect(function (res) {
	      if (!(res.body.features.length === 1)) {
		return 'Not enough Loos'
	      }

	    })
	    .end(done)
	  })
	});



});


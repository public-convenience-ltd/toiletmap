var config = require('../../config/config');
var baseUrl = 'http://localhost:' + config.app.port;
var supertest = require('supertest');
var request = supertest(baseUrl);
var fakery = require('../fixtures');
var co = require('co');
var LooReport = require('../../models/loo_report')





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
	console.log(res.body.features);
	return 'Not enough Loos'
      }

    })
    .end(done)
  })


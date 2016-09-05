/* global before, after, it */
var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var supertest = require('supertest')
var request = supertest(baseUrl)

before(function (done) {
  done()
})
after(function (done) {
  done()
})

it('Basic map test', function (done) {
  request
        .get('/map/0/0')
        .set('Accept', 'text/html')
        .expect(function (res) {
            // console.log(res);
        })
        .end(done)
})

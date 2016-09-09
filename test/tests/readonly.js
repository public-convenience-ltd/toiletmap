/* global it, enteredDataLoos */
var config = require('../../config/config')
var baseUrl = 'http://localhost:' + config.app.port
var request2 = require('request')
var chai = require('chai')
var expect = chai.expect

it('try and post in readonly', function (done) {
  var stringID = enteredDataLoos.ops[0]._id.toString()

  request2({
    headers: {
      'Content-Type': 'application/json'
    },
    uri: baseUrl + '/remove/' + stringID,
    method: 'POST',
    followAllRedirects: true
  }, function (err, res, body) {
    if (err) { console.log(err) }
    expect(res.statusCode).to.equal(405)
    done()
  })
})

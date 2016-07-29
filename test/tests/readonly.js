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
var request2 = require('request');
var chai = require('chai');
var expect = chai.expect;


it('try and post in readonly', function (done) {
var stringID = enteredDataLoos.ops[0]._id.toString()

request2({
    headers: {
      'Content-Type': 'application/json'
    },
    uri: baseUrl+'/remove/'+stringID,
    method: 'POST',
    followAllRedirects: true
  }, function (err, res, body) {
	expect(res.statusCode).to.equal(405)
        done()
  });
})


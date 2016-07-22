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
	//public api 	
	importTest('End points in loo.js', './loos.js')
	importTest('Simple pages', './simple_pages.js')
	importTest('Sign in and out', './signin.js');
	importTest('Statistics','./statistics.js');
	importTest('reports.js', './reports.js')
	importTest('Stand alone map', './standaloneMap.js')

	//private api
	importTest('Loo reports private', './looReportsPrivate.js')




});


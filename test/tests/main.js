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
var fs = require('fs');

function importTest(name, path) {
    describe(name, function () {
        require(path);
    });
}

describe('start testing',function(){
	describe('standard mode',function(){
	  before(function (done) {
	    co(function * () {
	      yield app.init(config)
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

		//ui //currently doesnt work
		importTest('Test ui handlers', './ui.js')


		//public api 	
		importTest('End points in loo.js', './loos.js')
		importTest('Simple pages', './simple_pages.js')
		importTest('Sign in and out', './signin.js');
		importTest('Statistics','./statistics.js');
		importTest('reports.js', './reports.js')
		importTest('Stand alone map', './standaloneMap.js')

		//private api
		importTest('auth', './auth.js')
		importTest('Loo reports private', './looReportsPrivate.js')
	});


	//currently doesnt work because read only mode isn't set as true
	describe('start testing in readonly mode',function(){
	  before(function (done) {
	    co(function * () {
	      yield app.init(config)
	      done()
	    })
	  })
	  // tear it down after
	  after(function (done) {
	    app.server.tclose = thunk(app.server.close)
	    co(function * () {
	      config.app.readonly = 
	      yield app.server.tclose()
	    }).then(done)
	  })
		//importTest('basic readonly test', './readonly.js')

	});
});

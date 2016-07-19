var mongoose = require('mongoose');
var assert = require('assert');
var Loo = require('../models/loo')
var LooReport = require('../models/loo_report')


var looID = require('./data/looID.js').Loos
var looReportsAll = require('./data/looReportsAll').Reports
var statisticsLoos = require('./data/looReportsAll').Loos



var stringConversion = {
			"looID":looID,
			"looReportsAll":looReportsAll,
			"statisticsLoos":statisticsLoos
		       }


exports.dataLoader = function(model,data,callback){
	model.collection.insertMany(stringConversion[data], function(err,r) {
		callback(err,r)
	})
}



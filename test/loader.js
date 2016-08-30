var mongoose = require('mongoose');
var assert = require('assert');
var Loo = require('../models/loo')
var LooReport = require('../models/loo_report')



var looID = require('./data/looID.js').Loos
var looReportsAll = require('./data/looReportsAll.js').Reports
var statisticsLoos = require('./data/statistics.js').Loos
var looBox = require('./data/looBox.js').Loos
var looRadius = require('./data/looRadius.js').Loos.features
var looEmpty = require('./data/looID.js').Loos





var stringConversion = {
			"looID":looID,
			"looReportsAll":looReportsAll,
			"statisticsLoos":statisticsLoos,
			"looBox":looBox,
			"looRadius":looRadius,
			"looEmpty":looEmpty
		       }


exports.dataLoader = function(model,data,callback){
	model.collection.insertMany(stringConversion[data], function(err,r) {
		callback(err,r)
	})
}



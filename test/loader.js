var mongoose = require('mongoose');
var assert = require('assert');
var Loo = require('../models/loo')
var looID = require('./data/looID.js').Loos

var stringConversion = {
			"looID":looID
		       }


exports.dataLoader = function(database_name,data,callback){
	Loo.collection.insertMany(stringConversion[data], function(err,r) {
		callback(err,r)
	})
}



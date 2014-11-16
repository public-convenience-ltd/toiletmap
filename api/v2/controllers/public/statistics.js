'use strict';

var Loo = require('../../../../models/loo'),
    LooReport = require('../../../../models/loo_report'),
    config = require('../../../../config/config'),
    _ = require('lodash'),
    thunkify = require('thunkify'),
    routes = {};

routes.statistics = {
    handler: function*(){
    	var loosCount = yield Loo.count().exec(),
    		activeLoos = yield Loo.count({'properties.active': true}).exec(),
    		looReports = yield LooReport.count().exec(),
    		uiReports = yield LooReport.count({'collectionMethod': 'api'}).exec(),
    		importedReports = looReports - uiReports,
    		removals = yield LooReport.count({'properties.removal_reason': {$exists: true}}).exec();
        this.status = 200;
        this.body = {
        	'Total Toilets Recorded': loosCount,
        	'Toilets Active on Map': activeLoos,
        	'Inactive/Removed Toilets': loosCount - activeLoos,
        	'Total Loo Reports Recorded': looReports,
        	'Total Reports via Web UI/API': uiReports,
        	'Reports from Data Collections': importedReports,
        	'Toilet Removal Reports': removals
        };
    },
    path: '/statistics',
    method: 'get'
};


module.exports = routes;
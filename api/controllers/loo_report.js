var mongo = require('../../config/mongo'),
    LooReport = require('../../models/loo_report'),
    LooList = require('../../models/loo_list'),
    config = require('../../config/config'),
    thunk = require('thunkify'),
    parse = require('co-body'),
    _ = require('lodash'),
    handlers = {};

handlers.list_reports = function*(){
    var reports = yield LooReport.find().exec();
    this.status = 200;
    this.body = new LooList(reports);
};


handlers.view_report = function*(){
    var report = yield LooReport.findById(this.params.id).exec();
    if (!report) {
        this.throw(404);
    }
    this.status = 200;
    this.body = report;
};

handlers.submit_report = function*(){
    var data = yield parse(this);
    var validator = new LooReport(data);
    validator.validate = thunk(validator.validate);
    try {
        yield validator.validate();
    } catch (e) {
        if (e.name === 'ValidationError') {
            this.throw(400, _.pluck(e.errors, 'message').join('\n'));
        } else {
            throw e;
        }
    }
    var report = yield LooReport.processReport(data);
    console.log(report._id);
    
};


exports.init = function(app){
    app.get('reports', '/api/reports', handlers.list_reports);
    app.get('report', '/api/reports/:id', handlers.view_report);
    app.post('submit_report', '/api/reports', handlers.submit_report);
};
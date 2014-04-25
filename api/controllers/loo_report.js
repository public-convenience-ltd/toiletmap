var mongo = require('../../config/mongo'),
    LooReport = require('../../models/loo_report'),
    LooList = require('../../models/loo_list'),
    config = require('../../config/config'),
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


exports.init = function(app){
    app.get('reports', '/api/reports', handlers.list_reports);
    app.get('report', '/api/reports/:id', handlers.view_report);
};
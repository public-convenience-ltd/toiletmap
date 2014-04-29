var LooReport = require('../../../../models/loo_report'),
    LooList = require('../../../../models/loo_list'),
    routes = {};

routes.reports = {
    handler: function*(){
        var reports = yield LooReport.find().exec();
        this.status = 200;
        this.body = new LooList(reports);
    },
    path: '/reports',
    method: 'get'
};

routes.report = {
    handler: function*(){
        var report = yield LooReport.findById(this.params.id).exec();
        if (!report) {
            this.throw(404);
        }
        this.status = 200;
        this.body = report;
    },
    path:'/reports/:id',
    method: 'get'
};

module.exports = routes;
'use strict';

var Loo = require('../../../../models/loo'),
    LooList = require('../../../../models/loo_list'),
    config = require('../../../../config/config'),
    routes = {};

routes.loos = {
    handler: function*(){
        var loos = yield Loo.find().exec();
        this.status = 200;
        this.body = new LooList(loos);
    },
    path: '/loos',
    method: 'get'
};

routes.nearby_loos = {
    handler: function*(){
        var maxDistance = this.query.radius || config.query_defaults.maxDistance;
        var loos = yield Loo.findNear(this.params.lon, this.params.lat, maxDistance).exec();
        this.status = 200;
        this.body = new LooList(loos);
    },
    path: '/loos/near/:lon/:lat',
    method: 'get'
};

routes.loo = {
    handler: function*(){
        var loo = yield Loo.findById(this.params.id).exec();
        if (!loo) {
            return;
        }
        this.status = 200;
        this.body = loo;
    },
    path: '/loos/:id',
    method: 'get'
};

module.exports = routes;
'use strict';

var mongo = require('../../config/mongo'),
    Loo = require('../../models/loo').Loo,
    serializer = require('../serializers/resource'),
    config = require('../../config/config'),
    handlers = {};

handlers.list_loos = function*(){
    var loos = yield Loo.find().exec();
    this.status = 200;
    this.body = loos;
};

handlers.nearby_loos = function*(){
    var maxDistance = this.query.radius || this.query.maxDistance || config.query_defaults.maxDistance;
    var loos = yield Loo.findNear(this.params.lon, this.params.lat, maxDistance).exec();
    this.status = 200;
    this.body = loos;
};

handlers.view_loo = function*(){
    var loo = yield Loo.findById(this.params.id).exec();
    if (!loo) {
        this.throw(404);
    }
    this.status = 200;
    this.body = serializer(this, loo);
};

exports.init = function(app){
    app.get('loos', '/api/loos', handlers.list_loos);
    app.get('loos_near', '/api/loos/near/:lon/:lat', handlers.nearby_loos);
    app.get('loo', '/api/loos/:id', handlers.view_loo);
};
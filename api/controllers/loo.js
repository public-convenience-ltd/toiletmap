'use strict';

var mongo = require('../../config/mongo'),
    config = require('../../config/config'),
    handlers = {};

handlers.list_loos = function*(){
    var loos = yield mongo.loos.find({});
    this.status = 200;
    this.body = loos;
};

handlers.nearby_loos = function*(){
    var maxDistance = this.query.radius || this.query.maxDistance || config.query_defaults.maxDistance;
    var loos = yield mongo.loos.find({
        geometry: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(this.params.lon), parseFloat(this.params.lat)]
                },
                $maxDistance: parseFloat(maxDistance)
            }
        }
    });
    this.status = 200;
    this.body = loos;
};

handlers.view_loo = function*(){
    var loo = yield mongo.loos.findById(this.params.id);
    if (!loo) {
        this.throw(404);
    }
    this.status = 200;
    this.body = loo;
};

exports.init = function(app){
    app.get('/api/loos', handlers.list_loos);
    app.get('/api/loos/near/:lon/:lat', handlers.nearby_loos);
    app.get('/api/loos/:id', handlers.view_loo);
};
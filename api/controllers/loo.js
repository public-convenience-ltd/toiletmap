'use strict';

var mongo = require('../../config/mongo'),
    handlers = {};

handlers.list_loos = function*(){
    var loos = yield mongo.loos.find({});
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
    app.get('/api/loos/:id', handlers.view_loo);
};
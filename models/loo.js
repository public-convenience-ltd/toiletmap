'use strict';

var mongoose = require('mongoose'),
    looSchema = require('./loo_schema').looSchema,
    _ = require('lodash'),
    halson = require('halson'),
    earth = 6731000,
    Loo;

looSchema.statics.findNear = function(lon, lat, maxDistance) {
    return this.aggregate([
        {
            $geoNear: {
                near: [parseFloat(lon), parseFloat(lat)],
                distanceField: "distance",
                maxDistance: (parseFloat(maxDistance)/earth),
                distanceMultiplier: earth,
                spherical: true
            }
        }
    ]);
};

looSchema.methods.toHAL = function(app){
    var hal = halson(this.toJSON());
    hal.addLink('self', app.url('loo', { id: this._id }));
    return hal;
};

looSchema.methods.toGeoJSON = function(app){
    return this.toJSON();
};

looSchema.methods.toCSV = function(app){
    return '';
};

looSchema.statics.fromLooReport = function(report) {
    var base = _.pick(report.toJSON(), 'geometry', 'properties', 'type', 'geohash'),
        loo = new Loo(base);

    loo.reports.push(report._id);
    loo.sources.push(report.source);
    loo.attributions.push(report.attribution);
    return loo;
};


module.exports = Loo = mongoose.model('Loo', looSchema);
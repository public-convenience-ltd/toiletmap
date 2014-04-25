'use strict';

var mongoose = require('mongoose'),
    geoJSON = require('mongoose-geojson-schema'),
    _ = require('lodash'),
    halson = require('halson'),
    earth = 6731000;

var looSchema = new mongoose.Schema(
    _.merge(
        geoJSON.Feature,
        {   
            geohash: String
        }
    )
);
looSchema.index({geometry: '2dsphere'});

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

looSchema.methods.toHAL = function toHAL(app){
    var hal = halson(this.toJSON());
    hal.addLink('self', app.url('loo', { id: this._id }));
    return hal;
};

looSchema.methods.toGeoJSON = function toGeoJSON(app){
    return this.toJSON();
};

looSchema.methods.toCSV = function toCSV(app){
    return '';
};

var looListSchema = new mongoose.Schema(
    _.merge(
        geoJSON.FeatureCollection,
        {
            features: [looSchema]
        }
    ),
    { _id: false }
);

module.exports.looSchema = looSchema;
module.exports.looListSchema =looListSchema;
module.exports.LooList = mongoose.model('LooList', looListSchema);
module.exports.Loo = mongoose.model('Loo', looSchema);
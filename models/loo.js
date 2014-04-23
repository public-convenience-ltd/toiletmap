'use strict';

var mongoose = require('mongoose'),
    geoJSON = require('mongoose-geojson-schema'),
    _ = require('lodash'),
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


module.exports.looSchema = looSchema;
module.exports.Loo = mongoose.model('Loo', looSchema);
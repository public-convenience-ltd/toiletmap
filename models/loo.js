'use strict';

var mongoose = require('mongoose'),
    looSchema = require('./loo_schema').looSchema,
    _ = require('lodash'),
    thunk = require('thunkify'),
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

/**
 * Rebuild a loo's data by recompiling it from all the reports that have been attatched
 * Currently this leaves a loo's location as that of the first report submitted
 */
looSchema.methods.regenerate = function*(){
    this.populate = thunk(this.populate);
    // populate the array of report ids with their documents
    var loo = yield this.populate('reports');
    // Make an array of property objects ordered by trustworthiness
    var properties = _.pluck(_.sortBy(loo.reports, 'trust'), 'properties');
    // Merge them together in that order
    loo.properties = _.merge.apply(_, properties);
    // Record all the sources and attributions
    loo.sources = _.pluck(loo.reports, 'source');
    loo.attributions = _.pluck(loo.reports, 'attribution');
    return this;
    
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
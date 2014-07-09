'use strict';

var mongoose = require('mongoose'),
    looSchema = require('./loo_schema').looSchema,
    _ = require('lodash'),
    thunk = require('thunkify'),
    halson = require('halson'),
    earth = 6731000,
    Loo;

looSchema.statics.findNear = function(lon, lat, maxDistance, limit) {
    return this.aggregate([
        {
            $geoNear: {
                near: [parseFloat(lon), parseFloat(lat)],
                distanceField: "distance",
                maxDistance: (parseFloat(maxDistance)/earth),
                limit: limit,
                distanceMultiplier: earth,
                spherical: true
            }
        }
    ]);
};

looSchema.statics.findIn = function(sw, ne, nw, se) {
    return this.find({
        geometry: {
            $geoIntersects: {
                $geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        _.map(sw.split(','), parseFloat),
                        _.map(nw.split(','), parseFloat),
                        _.map(ne.split(','), parseFloat),
                        _.map(se.split(','), parseFloat),
                        _.map(sw.split(','), parseFloat)
                    ]]
                }
            }
        }
    });
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

function calculate_credibility(reports){
    //score each report out of 20, 10 for trust 10 for completeness
    return _.reduce(reports, function(sum, rep){
        var completeness = 0,
            penalties = 0,
            trust = rep.trust, 
            props = _.keys(rep.properties).length;
        if (props > 3) {
            completeness = 2;
        }
        if (props > 5) {
            completeness = 5;
        }
        if (props > 8) {
            completeness = 7
        }
        if (props > 12) {
            completeness = 9
        }
        if (props > 15) {
            completeness = 10;
        }
        if (props.geocoded) {
            penalties += -5;
        }
        return sum + ((trust + completeness) - penalties)
    }, 0) / reports.length;
}

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
    loo.sources = _.pluck(loo.reports, 'origin');
    loo.attributions = _.pluck(loo.reports, 'attribution');

    // Calculate credibility
    loo.credibility = calculate_credibility(loo.reports);

    return this;
    
};

looSchema.statics.fromLooReport = function(report) {
        var base = _.pick(report.toJSON(), 'geometry', 'properties', 'type'),
            loo = new Loo(base);

        loo.reports.push(report._id);
        loo.sources.push(report.origin);
        loo.attributions.push(report.attribution);
        return loo;
};


module.exports = Loo = mongoose.model('Loo', looSchema);
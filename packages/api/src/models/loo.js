const mongoose = require('mongoose');
const looSchema = require('./loo_schema').looSchema;
const _ = require('lodash');
var Loo;

looSchema.statics.findNear = function(lon, lat, radius) {
  return this.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        distanceField: 'distance',
        maxDistance: radius,
        spherical: true,
        limit: 2 ** 62, // infeasibly large number
      },
    },
    {
      $match: {
        'properties.active': true,
      },
    },
  ]);
};

looSchema.statics.findIds = function(query) {
  var q = query || {};
  return this.find(q).select('id');
};

looSchema.methods.toGeoJSON = function() {
  return this.toJSON();
};

function calculateCredibility(reports) {
  // score each report out of 20, 10 for trust 10 for completeness
  return (
    _.reduce(
      reports,
      function(sum, rep) {
        var completeness = 0;
        var penalties = 0;
        var trust = rep.trust;
        var props = _.size(
          _.filter(rep.properties, function(v) {
            return !_.isFunction(v) && !_.isUndefined(v);
          })
        );
        if (props > 4) {
          completeness = 2;
        }
        if (props > 5) {
          completeness = 3;
        }
        if (props > 8) {
          completeness = 7;
        }
        if (props > 12) {
          completeness = 9;
        }
        if (props > 15) {
          completeness = 10;
        }
        if (props.geocoded) {
          penalties += -8;
        }
        return sum + (trust + completeness - penalties);
      },
      0
    ) / reports.length
  );
}

/**
 * Rebuild a loo's data by recompiling it from all the reports that have been attatched
 * Currently this leaves a loo's location as that of the most recent report submitted
 */
looSchema.methods.regenerate = async function() {
  // populate the array of report ids with their documents
  const loo = await this.populate('reports').execPopulate();
  // Make an array of property objects ordered by trustworthiness then by freshness
  var properties = _.map(
    _.sortBy(loo.reports, ['trust', 'updatedAt']),
    function(report) {
      return report.properties.toJSON();
    }
  );
  // Merge them together in that order
  loo.properties = _.merge.apply(_, properties);
  // Record all the sources and attributions
  loo.sources = _.uniq(_.map(loo.reports, 'origin'));
  loo.attributions = _.uniq(_.map(loo.reports, 'attribution'));

  // Potential coordinate solutions.
  var recentLooReports = _.remove(
    _.sortBy(loo.reports, ['updatedAt']),
    function(report) {
      if (report.updatedAt !== undefined) {
        return report;
      }
    }
  );
  var geometry = { type: 'Point', coordinates: [] };

  /*
  //Averages ALL reports
  geometry.coordinates[0] = _.meanBy(loo.reports, function(report) { return report.geometry.coordinates[0]; });
  geometry.coordinates[1] = _.meanBy(loo.reports, function(report) { return report.geometry.coordinates[1]; });
*/

  // The most recent user can just change the co-ordinates.
  geometry.coordinates[0] =
    recentLooReports[recentLooReports.length - 1].geometry.coordinates[0];
  geometry.coordinates[1] =
    recentLooReports[recentLooReports.length - 1].geometry.coordinates[1];

  /*
  //Skewed average based on trust
  geometry.coordinates[0] = _.meanBy(loo.reports, function(report) { return report.geometry.coordinates[0]*report.trust;})/_.sumBy(trustedLooReports,'trust');
  geometry.coordinates[1] = _.meanBy(loo.reports, function(report) { return report.geometry.coordinates[1]*report.trust;})/_.sumBy(trustedLooReports,'trust');
*/

  // Calculate credibility
  loo.credibility = calculateCredibility(loo.reports);
  return this;
};

looSchema.statics.fromLooReport = function(report) {
  var base = _.pick(report.toJSON(), 'geometry', 'properties', 'type');
  var loo = new Loo(base);

  loo.reports.push(report._id);
  loo.sources.push(report.origin);
  loo.attributions.push(report.attribution);
  return loo;
};

module.exports = Loo = mongoose.model('Loo', looSchema);

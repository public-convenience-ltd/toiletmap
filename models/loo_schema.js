'use strict';

var _ = require('lodash'),
    Schema = require('mongoose').Schema,
    geoJSON = require('mongoose-geojson-schema'),
    timestamps = require('mongoose-timestamp'),
    stampopts = {},
    specs = {},
    schemae = {};

specs.looProperties = {};
specs.looCore = _.merge(
    geoJSON.Feature, 
    {
        properties: specs.looProperties,
        geohash: String
    }
);

schemae.looReportSchema = new Schema(
    _.merge(
        specs.looCore,
        {
            source: String,
            attribution: String
        }
    )
);
schemae.looReportSchema.plugin(timestamps, stampopts);
schemae.looReportSchema.index({geohash: 1});

schemae.looSchema = new Schema(
    _.merge(
        specs.looCore,
        {
            sources: [String],
            attributions: [String],
            reports: [{ type: Schema.Types.ObjectId, ref: 'LooReport' }]
        }
    )
);
schemae.looSchema.plugin(timestamps, stampopts);
schemae.looSchema.index({geometry: '2dsphere'});
schemae.looSchema.index({geohash: 1});

module.exports = schemae;
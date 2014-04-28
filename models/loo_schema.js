'use strict';

var _ = require('lodash'),
    Schema = require('mongoose').Schema,
    GeoJSON = require('mongoose-geojson-schema'),
    timestamps = require('mongoose-timestamp'),
    stampopts = {},
    specs = {},
    schemae = {};

specs.looProperties = {};
specs.looCore = {
    'type'    : { type: String, default: "Feature" },
    geometry  : {
        type: { type: String, required: '"{PATH}" should be "Point" and is required' },
        coordinates: [{type: "Number"}],
        
    },
    properties: specs.looProperties,
    geohash: String
};

schemae.looReportSchema = new Schema(
    _.merge(
        specs.looCore,
        {
            source: String,
            attribution: {type: String, required: '"{PATH}" to a person or orgainisation is required'},
            trust: {type: Number, default: 5}
        }
    )
);
schemae.looReportSchema.plugin(timestamps, stampopts);
schemae.looReportSchema.index({geohash: 1});
schemae.looReportSchema.index({geohash: 1, attribution: 1});

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
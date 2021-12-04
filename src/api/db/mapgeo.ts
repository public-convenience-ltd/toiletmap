const mongoose = require('mongoose');

const TopoGeometrySchema = new mongoose.Schema({
  type: {
    type: String,
  },
  /* // doesn't seem to be included after conversion
    transform: {
      scale: Array,
      translate: Array
    },
    */
  // This is not a normal TopoJSON format - this is only to allow mongoose type checking. `objects` should
  // be converted to an object with key = name, and value = value, before passing to any function expecting
  // valid TopoJSON.
  objects: [
    {
      name: String,
      value: {
        type: {
          type: String,
        },
        geometries: [
          {
            type: {
              type: String,
            },
            arcs: [Array],
            properties: Object,
          },
        ],
      },
    },
  ],
  arcs: [[Array]],
});

const MapGeoSchema = new mongoose.Schema(
  {
    datasetId: Number,
    version: Number,
    areaType: String,
    geometry: TopoGeometrySchema,
  },
  { minimize: false }
);

MapGeoSchema.index({ areaType: 'text' });

module.exports =
  mongoose.models.MapGeo || new mongoose.model('MapGeo', MapGeoSchema);

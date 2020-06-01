const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Polygon = new mongoose.Schema({
  type: {
    type: String,
    enum: ['MultiPolygon', 'Polygon'],
    required: true,
  },
  coordinates: {
    type: mongoose.SchemaTypes.Mixed,
    required: true,
  },
});

// We let mongoose auto-generate an id
const Area = new Schema({
  name: String,
  geometry: Polygon,
  type: String,
  priority: Number,
  version: Number,
  datasetId: Number,
});

Area.index({ geometry: '2dsphere' });
Area.index({ name: 'text' });

mongoose.model('Area', Area);

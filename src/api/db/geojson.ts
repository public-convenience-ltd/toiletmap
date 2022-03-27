import { Schema } from 'mongoose';

function ofLength(n) {
  return [(list) => list.length === n, `{PATH} must be of length ${n}`];
}

export const Point = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: () => this.geometry,
  },
  coordinates: {
    type: [Number],
    required: () => this.geometry,
    validate: ofLength(2),
  },
  _id: false,
});

// Not just Polygon, but MultiPolygon too!
export const Polygon = new Schema({
  type: {
    type: String,
    enum: ['MultiPolygon', 'Polygon'],
    required: () => this.geometry,
  },
  coordinates: {
    type: Schema.Types.Mixed,
    required: () => this.geometry,
  },
  _id: false,
});

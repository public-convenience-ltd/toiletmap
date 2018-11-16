const { Schema } = require('mongoose');

function ofLength(n) {
  return [list => list.length === n, `{PATH} must be of length ${n}`];
}

exports.Point = new Schema({
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

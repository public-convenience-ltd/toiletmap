var mongoose = require('mongoose');

exports.Loos = [
  {
    _id: new mongoose.mongo.ObjectId(),
    geohash: 'gcpkdwe0hd9k',
    credibility: 6,
    reports: [new mongoose.mongo.ObjectId('54149f7e115902773aa8ef55')],
    attributions: ['Open Street Map'],
    sources: ['http://overpass-api.de'],
    properties: {
      active: true,
      access: 'public',
      fee: 'false',
      orig: {
        id: 'node/649717893',
        fee: 'no',
        amenity: 'toilets',
      },
    },
    geometry: {
      type: 'Point',
      coordinates: [-0.9405095, 51.4517354],
    },
    type: 'Feature',
    __v: 0,
  },
];

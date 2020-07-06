const mongoose = require('mongoose');
const Loo = require('./loo');
const Report = require('./report');
const Area = require('./area');
const MapGeo = require('./mapgeo');

module.exports = {
  connect: function connect(url) {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useFindAndModify', false);
    mongoose.connect(url);
  },
  Loo,
  Report,
  Area,
  MapGeo,
};

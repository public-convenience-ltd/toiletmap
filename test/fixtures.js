var fakery = require('mongoose-fakery')
var thunk = require('thunkify')
var Loo = require('../models/loo')

fakery.generator('lonlat', function (bounds) {
  var bbox = bounds || [60.85, 2.69, 49.84, -9.23]
  function randFloat (min, max, precision) {
    return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
  }
  return [randFloat(bbox[3], bbox[1], 5), randFloat(bbox[2], bbox[0], 5)]
})

fakery.fake('loo', Loo, {
  geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlat()
  }
})

fakery.makeAndSave = thunk(fakery.makeAndSave)

module.exports = fakery

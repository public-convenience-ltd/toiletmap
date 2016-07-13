var fakery = require('mongoose-fakery')
var thunk = require('thunkify')
var Loo = require('../models/loo')
var mongoose = require('mongoose');


//generators

//Generates random loos with box
fakery.generator('lonlatBox', function (bounds) {
  var bbox = bounds || [60.85, 2.69, 49.84, -9.23]
  function randFloat (min, max, precision) {
    return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
  }
  result =  [randFloat(bbox[3], bbox[1], 5), randFloat(bbox[2], bbox[0], 5)]
  return result
})

//generates random loos within a cirle -- technically not correct, looking for better alternative
fakery.generator('lonlatCircle', function (bounds) {
  var boundaries = bounds || [0.007,0,0] //[radius,long,lat]
  function randFloat (min, max, precision) {
    return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
  }

 result = [randFloat(0,boundaries[0],5)*Math.sin(randFloat(0,6.28,5))+ boundaries[1],randFloat(0,boundaries[0],5)*Math.sin(randFloat(0,6.28,5))+boundaries[2]];
  return result
})




//models to be faked
fakery.fake('looBox', Loo, {
  geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlatBox()
  }
})

fakery.fake('looCircle', Loo, {
  geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlatCircle()
  }
})

//var newId = new mongoose.mongo.ObjectID('56cb91bdc3464f14678934ca')
fakery.fake('looWithID', Loo, {
  geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlatCircle()
  }
})



fakery.makeAndSave = thunk(fakery.makeAndSave)


module.exports = fakery

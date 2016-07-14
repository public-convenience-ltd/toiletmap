var fakery = require('mongoose-fakery')
var thunk = require('thunkify')
var Loo = require('../models/loo')
var LooReport = require('../models/loo_report')
var LooList = require('../models/loo_list')

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

//generates random loos within a circle
fakery.generator('lonlatCircle', function (bounds) {
  var boundaries = bounds || [0.007,0,0] //[radius,long,lat]
  function randFloat (min, max, precision) {
    return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
  }

 result = [randFloat(0,boundaries[0],5)*Math.sin(randFloat(0,6.28,5))+ boundaries[1],randFloat(0,boundaries[0],5)*Math.sin(randFloat(0,6.28,5))+boundaries[2]];
  return result
})

fakery.generator('statisticGenerator', function (bounds) {
  function randFloat (min, max, precision) {
    return parseFloat(Math.min(min + (Math.random() * (max - min)), max).toFixed(precision))
  }

	returnvalue = randFloat(0,1,0);
	boolList = ['true','false']
	
	console.log(boolList[returnvalue]);
	return boolList[returnvalue];

		
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

fakery.fake('looWithID', Loo, {
  geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlatCircle()
  }
})

fakery.fake('statisticLoo', Loo, {
 properties: { access: 'public', active: fakery.g.statisticGenerator(17) },
 geometry: {
    type: 'Point',
    coordinates: fakery.g.lonlatCircle()
  }
})


fakery.fake('LooReport',LooReport,{

       attribution: 'Brighton & Hove City Council',
       geohash: 'gcpc5mrg6yb9',
       origin: 'http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml',
       trust: 4,
       properties:{"name":"Aldrington Recreation (Saxon)","access":"public","active":true}, 
       geometry: {type:'Point',coordinates:fakery.g.lonlatCircle()},
       type: 'Feature' 




})









fakery.makeAndSave = thunk(fakery.makeAndSave)


module.exports = fakery

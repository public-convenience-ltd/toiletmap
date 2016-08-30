var mongoose = require('mongoose');
exports.Reports = [
{
	"_id": new mongoose.mongo.ObjectId(),
	"__v": 0,
	"attribution": "Brighton & Hove City Council",
	"geohash": "gcpc5pesbg6j",
	"geometry": {
		"type": "Point",
		"coordinates": [-0.214885158078858, 50.84281367426335]
	},
	"origin": "http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml",
	"properties": {
		"name": "Easthill Park",
		"removal_reason":"some reason"
	},
	"trust": 4,
	"type": "Feature"
},
{
	"_id": new mongoose.mongo.ObjectId(),
	"__v": 0,
	"attribution": "Brighton & Hove City Council",
	"geohash": "gcpc714c10mj",
	"geometry": {
		"type": "Point",
		"coordinates": [-0.21590017583081914, 50.85039363898911]
	},
	"collectionMethod":"api", //this is a bit of a hack..
	"origin": "http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml",
	"properties": {
		"name": "Foredown Tower",
		"removal_reason":"some reason"

	},
	"trust": 4,
	"type": "Feature"
}, 
{
	"_id": new mongoose.mongo.ObjectId(),
	"__v": 0,
	"attribution": "Brighton & Hove City Council",
	"geohash": "gcpchjddhb42",
	"geometry": {
		"type": "Point",
		"coordinates": [-0.17214085595304487, 50.8313369798573]
	},
	"origin": "http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml",
	"properties": {
		"name": "Goldstone Villas"
	},
	"trust": 4,
	"type": "Feature"
},
{
	"_id": new mongoose.mongo.ObjectId(),
	"__v": 0,
	"attribution": "Brighton & Hove City Council",
	"geohash": "gcpchtsnkk1p",
	"geometry": {
		"type": "Point",
		"coordinates": [-0.14813155019597013, 50.8320892491734]
	},
	"collectionMethod":"api",
	"origin": "http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml",
	"properties": {
		"name": "Good Companions PH"
	},
	"trust": 4,
	"type": "Feature"
}, 
{
	"_id": new mongoose.mongo.ObjectId(),
	"__v": 0,
	"attribution": "Brighton & Hove City Council",
	"geohash": "gcpc726d1037",
	"geometry": {
		"type": "Point",
		"coordinates": [-0.205262129148716, 50.846445147806165]
	},
	"origin": "http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml",
	"properties": {
		"name": "Greenleas"
	},
	"trust": 4,
	"type": "Feature"
}]


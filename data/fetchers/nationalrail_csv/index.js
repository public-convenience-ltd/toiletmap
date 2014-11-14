var through = require('through'),
    Converter = require('csvtojson').core.Converter,
    fs = require('fs'),
    JSONStream = require('JSONStream'),
    request = require('request'),
    es = require('event-stream'),
    _ = require('lodash');

function useLonLat(){
    return through(function write(data){
        if (data.geometry.coordinates.length !== 2) {
            if (data.properties.longitude && data.properties.latitude) {
                data.geometry.coordinates = [parseFloat(data.properties.longitude, 10), parseFloat(data.properties.latitude, 10)];
            }
        }
        this.queue(data);
    });
}

function compact(){
    return through(function write(data){
        var compact = _.pick(data, function(val){ return _.indexOf(['', '/', null], val) === -1; });
        this.queue(compact);
    });
}

function lowerCaseProps(){
    return through(function write(data){
        data.properties = _.transform(data.properties, function(result, val, key) {
            result[key.toLowerCase()] = val;
        });
        this.queue(data);
    });
}

function toGeoJSON() {
    return through(function write(data){
        var gj = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: []
            }
        };
        gj.properties = data;
        this.queue(gj);
    });
}

function noteOrigin(){
    return through(function write(data){
        data.origin = 'National Rail Enquiries';
        this.queue(data);
    });
}

function addTrust(){
    return through(function write(data){
        data.trust = 7;
        this.queue(data);
    });
}

function filterUnlocated(){
    return through(function write(data){
        if (_.compact(data.geometry.coordinates).length === 2) {
            this.queue(data);
        }
    });
}

function filterNoLoo(){
    return through(function write(data){
        if (data.properties['wc available']==='Y') {
            this.queue(data);
        }
    });
}


module.exports = function items(path) {
    var out = through();
    

    var fileStream=fs.createReadStream(path);
    //new converter instance
    var csvConverter=new Converter({constructResult:true});

    //read from file
    fileStream
        .pipe(csvConverter)
        .pipe(JSONStream.parse([true]))
        .pipe(compact())
        .pipe(toGeoJSON())
        .pipe(lowerCaseProps())
        .pipe(filterNoLoo())
        .pipe(useLonLat())
        .pipe(noteOrigin())
        .pipe(addTrust())
        .pipe(filterUnlocated())
        .pipe(out);

    return out;
};
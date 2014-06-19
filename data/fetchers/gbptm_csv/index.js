var through = require('through'),
    Converter = require('csvtojson').core.Converter,
    OSPoint = require('ospoint'),
    OSGridRef = require('mt-osgridref'),
    UKPostcode = require('uk-postcodes-node'),
    fs = require('fs'),
    JSONStream = require('JSONStream'),
    _ = require('lodash');

function usePostcode(){
    return through(function write(data){
        var stream = this;
        if (data.geometry.coordinates.length !== 2) {
            if (data.properties.postcode) {
                UKPostcode.getPostcode(data.properties.postcode, function(err, coded) {
                    if (coded) {
                        data.geometry.coordinates = [coded.geo.lng, coded.geo.lat];
                        data.properties.geocoded = true;
                    }
                    stream.queue(data);
                });
            }
        }
    });
}

function useGridRef(){
    return through(function write(data){
        var coords;
        if (data.geometry.coordinates.length !== 2) {
            if (data.properties['grid ref']) {
                coords = OSGridRef.osGridToLatLong(OSGridRef.parse(data.properties['grid ref']));
                if (!isNaN(coords._lat) && !isNaN(coords._lon)) {
                    data.geometry.coordinates = [coords._lon, coords._lat];
                }
            }
        }
        this.queue(data);
    });
}

function useEastNorth(){
    return through(function write(data){
        var coords;
        if (data.geometry.coordinates.length !== 2) {
            if (data.properties.northings && data.properties.eastings) {
                coords = new OSPoint(data.properties.northings, data.properties.eastings).toWGS84();
                data.geometry.coordinates = [coords.longitude, coords.latitude];
            }
        }
        this.queue(data);
    });
}

function useLonLat(){
    return through(function write(data){
        if (data.geometry.coordinates.length !== 2) {
            if (data.properties.longitude && data.properties.latitude) {
                // Check for eastings and northings in the wrong column...
                if (data.properties.longitude > -100 && data.properties.longitude < 100) {
                    data.geometry.coordinates = [data.properties.longitude, data.properties.latitude];
                }
            }
        }
        this.queue(data);
    });
}

function compact(){
    return through(function write(data){
        var compact = _.pick(data, function(val){ return _.indexOf(['', '/'], val) === -1; });
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
        data.origin = data.properties['data collected from'] || 'unknown';
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
        .pipe(useLonLat())
        .pipe(useEastNorth())
        .pipe(useGridRef())
        .pipe(usePostcode())
        .pipe(noteOrigin())
        .pipe(filterUnlocated())
        .pipe(out);

    return out;
};
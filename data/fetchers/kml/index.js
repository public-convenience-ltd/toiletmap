var through = require('through'),
    kmltogeojson = require('togeojson'),
    request = require('request'),
    DOMParser = require('xmldom').DOMParser;


module.exports = function items(uri) {
    var out = through();
    request(uri, function(err, res) {
        if (err) {
            throw err;
        }
        var dom = (new DOMParser()).parseFromString(res.body, 'text/xml');
        var gj = kmltogeojson.kml(dom);
        gj.features.forEach(function(feat){
            out.write(feat);
        });
    });
    return out;
};
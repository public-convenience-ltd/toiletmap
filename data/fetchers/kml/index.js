var through = require('through')
var kmltogeojson = require('togeojson')
var request = require('request')
var DOMParser = require('xmldom').DOMParser

module.exports = function items (uri) {
  var out = through()
  request(uri, function (err, res) {
    if (err) {
      throw err
    }
    var dom = (new DOMParser()).parseFromString(res.body, 'text/xml')
    var gj = kmltogeojson.kml(dom)
    gj.features.forEach(function (feat) {
      // Some KML files will have altitude - which we don't support
      if (feat.geometry.coordinates.length > 2) {
        feat.geometry.coordinates = feat.geometry.coordinates.slice(0, 2)
      }
      out.write(feat)
    })
  })
  return out
}

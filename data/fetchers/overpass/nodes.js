var fs = require('fs')
var through = require('through')
var JSONStream = require('JSONStream')
var osmtogeojson = require('osmtogeojson')
var request = require('request')

/**
 * stream to convert osm json objects to geojson
 * expects to be fed with an object mode stream of individual entries
 * currently has a problem with ways...
 * @return {Stream}
 */
function geojsonify () {
  return through(function write (data) {
    // osmtogeojson expects to operate on an osm wrapper so we fake one
    var osmw = {elements: [data]}
    var fc = osmtogeojson(osmw, {flatProperties: true})
    var f = fc.features[0]
    // queue up the single entry from the feature collection if we got one
    if (f && (f.properties || f.tags)) {
      this.queue(f)
    }
  })
}

function items (qfile, endpoint) {
  var out = through()
  fs.createReadStream(qfile)
    .pipe(request.post(endpoint || 'http://overpass-api.de/api/interpreter'))
    .pipe(JSONStream.parse(['elements', true]))
    .pipe(geojsonify())
    .pipe(out)
  return out
}

module.exports = items

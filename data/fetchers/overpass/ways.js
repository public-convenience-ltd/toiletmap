var fs = require('fs')
var _ = require('lodash')
var through = require('through')
var osmtogeojson = require('osmtogeojson')
var request = require('request')
var streamArray = require('read-stream/array')

function centroid (pointArray) {
  /*
  pointArray should be an Array of point objects thus
  [{ "lat": 52.1311697,"lon": -0.9905828},
   { "lat": 52.1311697,"lon": -0.9905828}
  ]
  find centroid of irregular polygon, assumes no duplicated vertices,

  */
  var i
  var x = 0
  var y = 0
  for (i = 0; i < pointArray.length; i++) {
    x += pointArray[i].lon
    y += pointArray[i].lat
  }
  return {
    lat: y / pointArray.length,
    lon: x / pointArray.length
  }
}

/**
 * act on overpass response
 *   for each way take all but it's last node,
 *   pass these as array to the centroid function
 *   I do not optimize the search here by removing elements as the list is only 6000ish items long and it ain't worth it.
 *   1148 loos processed to single points
 *   real    0m0.136s
 *   user    0m0.132s
 *   sys     0m0.006s
 */
function extractLoos (list) {
  var ways = _.filter(list, {type: 'way'})
  var loos = _.map(ways, function (way) {
    var polygon = _.map(way.nodes, function (nid) {
      return _(_.find(list, {id: nid}))
        .pick('lat', 'lon')
        .value()
    })
    _.merge(way, {type: 'node'}, centroid(polygon))

    return _.omit(way, 'nodes')
  })
  return loos
}

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

  request.post({
    url: endpoint || 'http://overpass-api.de/api/interpreter',
    body: fs.readFileSync(qfile)
  }, function (err, res, body) {
      if (err) { throw err }
      var loos = extractLoos(JSON.parse(body).elements)
      streamArray(loos)
        .pipe(geojsonify())
        .pipe(out)
    })

  return out
}

module.exports = items

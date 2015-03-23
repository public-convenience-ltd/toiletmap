var through = require('through')
var geo = require('geo-hash')

function transform (prop) {
  return through(function write (data) {
    data[prop] = geo.encode(data.geometry.coordinates[1], data.geometry.coordinates[0])
    this.queue(data)
  })

}

module.exports = function (items, prop) {
  var out = through()
  items
    .pipe(transform(prop || 'geohash'))
    .pipe(out)
  return out
}

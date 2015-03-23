var through = require('through')

function transform (attribute, value) {
  return through(function write (data) {
    data[attribute] = value
    this.queue(data)
  })
}

module.exports = function (items, attribute, value) {
  var out = through()
  items
    .pipe(transform(attribute, value))
    .pipe(out)
  return out
}

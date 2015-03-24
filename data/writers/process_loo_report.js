var LooReport = require('../../models/loo_report')
var co = require('co')
var fromStream = require('co-from-stream')
var events = require('events')
require('../../config/mongo')

function write (items, collection) {
  var log = new events.EventEmitter()
  co(function * () {
    var counter = 0
    var read = fromStream(items)
    var data, result
    while ((data = yield read())) {
      result = yield LooReport.processReport(data)
      log.emit('detail', 'Report id ' + result[0]._id + ' written')
      log.emit('detail', JSON.stringify(result[0].properties, null, '\t'))
      log.emit('detail', 'Loo id ' + result[1]._id + ' written')
      counter++
    }
    log.emit('summary', counter + ' items imported')
    log.emit('end')
  }).then()
  return log
}

module.exports = write

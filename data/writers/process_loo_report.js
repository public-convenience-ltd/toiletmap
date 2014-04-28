var mongo = require('../../config/mongo'),
    LooReport = require('../../models/loo_report'),
    co = require('co'),
    fromStream = require('co-from-stream'),
    events = require('events');


function write(items, collection){
    var log = new events.EventEmitter();
    co(function*(){
        var counter = 0,
            read = fromStream(items),
            data, report;
        while ((data = yield read())) {
            yield LooReport.processReport(data);
            log.emit('detail', 'Item.geohash ' + data.geohash + ' written');
            counter++;
        }
        log.emit('summary', counter + ' items imported');
        log.emit('end');
    })();
    return log;
}

module.exports = write;
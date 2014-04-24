var mongo = require('../../config/mongo'),
    Loo = require('../../models/loo').Loo,
    co = require('co'),
    fromStream = require('co-from-stream'),
    events = require('events');

function write(items, collection){
    var log = new events.EventEmitter();
    co(function*(){
        var counter = 0,
            read = fromStream(items),
            data;
        while ((data = yield read())) {
            yield Loo.update({geohash: data.geohash}, data, {upsert: true}).exec();
            log.emit('detail', 'Item.geohash ' + data.geohash + ' written');
            counter++;
        }
        log.emit('summary', counter + ' items imported');
        log.emit('end');
    })();
    return log;
}

module.exports = write;
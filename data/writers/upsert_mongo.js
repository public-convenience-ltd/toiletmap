var mongo = require('../../config/mongo'),
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
            yield mongo[collection].update({id: data.id}, data, {upsert: true});
            log.emit('detail', 'Item.id ' + data.id + ' written');
            if (!data.id) {
                console.log(data);
            }
            counter++;
        }
        log.emit('summary', counter + ' items imported');
        log.emit('end');
    })();
    return log;
}

module.exports = write;
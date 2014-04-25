var mongo = require('../../config/mongo'),
    LooReport = require('../../models/loo_report'),
    Loo = require('../../models/loo'),
    co = require('co'),
    thunk = require('thunkify'),
    fromStream = require('co-from-stream'),
    events = require('events');

function* handleReport(raw){
    // Probably best to use a compound index with the attribution here?
    var report = yield LooReport.findOne({geohash: raw.geohash}).exec();
    if (!report) {
        report = new LooReport(raw);
    } 
    // Necessary 'till save returns a promise in mongoose 3.10
    report.save = thunk(report.save);
    yield report.save();
    // Do we have a loo which references this report?
    var loo = yield Loo.findOne({reports: { $in: [report._id] }}).exec();
    if (!loo) {
        // Nope. How about one which shares the same geohash to a precision of 7 (152.9m x 152.4m)
        // May actually be preferable to do $geoNear here.
        loo = yield Loo.findOne({geohash: { $regex: new RegExp('^'+report.geohash.slice(0, 7))}}).exec();
    }
    
    if (loo) {
        //TODO this...
        console.log('Loo Exists - add report - regenerate and save');
    } else {
        // Save a new loo derived from this report
        loo = Loo.fromLooReport(report);
        loo.save = thunk(loo.save);
        yield loo.save();
    }
}

function write(items, collection){
    var log = new events.EventEmitter();
    co(function*(){
        var counter = 0,
            read = fromStream(items),
            data, report;
        while ((data = yield read())) {
            yield handleReport(data);
            log.emit('detail', 'Item.geohash ' + data.geohash + ' written');
            counter++;
        }
        log.emit('summary', counter + ' items imported');
        log.emit('end');
    })();
    return log;
}

module.exports = write;
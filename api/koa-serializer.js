var _ = require('lodash'),
    methodLookup = {
        'application/json': 'toJSON',
        'application/hal+json': 'toHAL',
        'text/csv': 'toCSV'
    },
    availableTypes = _.keys(methodLookup);

module.exports = function(){
    return function*(next){
        yield next;
        var mt = this.accepts(availableTypes);
        if (!mt) {
            this.throw(406, 'Available mime types: ' + availableTypes.join(', '));
        }
        this.body = this.body[methodLookup[mt]].apply(this.body, [this.app]);
    };
};

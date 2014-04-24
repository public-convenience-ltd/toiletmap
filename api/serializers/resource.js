
var _ = require('lodash'),
    methodLookup = {
        'application/json': 'toJSON',
        'application/hal+json': 'toHAL',
        'text/csv': 'toCSV'
    },
    availableTypes = _.keys(methodLookup);

/**
 * Serialize a resource in the context of a request
 * negotiate the representation and set headers
 * @param  {Koa context} ctx
 * @param  {Model} resource 
 * @return {String}
 */
module.exports = function serialize(ctx, resource){
    var pref = ctx.accepts(availableTypes);
    console.log(pref);
    if (!pref) {
        ctx.throw(406, 'Available mime types: ' + availableTypes.join(', '));
    }
    return resource[methodLookup[pref]].apply(resource, [ctx.app]);
};
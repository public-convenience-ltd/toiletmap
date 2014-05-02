var _ = require('lodash');

module.exports = function(opts){
    var defaults = opts || {};
    return function*(next){
        // Apply pagination settings to the context
        this.paginate = {options: _.merge(defaults, _.pick(this.query, 'page', 'perPage', 'offset'))};
        yield next;
        // Discover if the response has been paginated
        if (this.paginate.next || this.paginate.prev) {
            console.log('paginated response');
            // Add link headers
        }
    };
};

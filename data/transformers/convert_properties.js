var through = require('through'),
    _ = require('lodash');


var booleanify = function(data){
    return _.mapValues(data, function(val){
        if (_.indexOf(['true', 'yes', '1'], val.toLowerCase()) !== -1) {
            return true;
        } else if (_.indexOf(['false', 'no', '0'], val.toLowerCase()) !== -1) {
            return false;
        } else {
            return val;
        }
    });
};

var convertTypeAndAccess = function(val, props) {
    var type,
        accessibilityType;
    if (props.male && props.female) {
        type = 'female and male';
    } else if (props.male && !props.female) {
        type = 'male';
    } else if (props.female && !props.male) {
        type = 'female';
    }

    if (!type && props.unisex) {
        type = 'unisex';
    }

    if (props.disabled || props.wheelchair) {
        accessibilityType = (props.unisex) ? 'unisex' : type || 'unisex';
    }

    return [{
        key: 'type',
        value: type
    },
    {
        key: 'accessibilityType',
        value: accessibilityType
    }];
};

var converters = {
    base: {
        name: function(val) {
            return [{
                key: 'name',
                value: val
            }];
        },
        description: function(val) { // Store descriptions in the notes field
            return [{
                key: 'notes',
                value: val
            }];
        },
        postcode: function(val) {
            return [{
                key: 'postcode',
                value: val
            }];
        },
        access: function(val){

            if (_.indexOf(['public', 'permissive', 'customers', 'private'], val) !== -1) {
                return [{
                    key: 'access',
                    value: val
                }];
            } else if (val === 'destination') { // some osm taggers use access=destination
                return [{
                    key: 'access',
                    value: 'customers'
                }];
            }

        },
        operator: function(val){
            return [{
                key: 'operator',
                value: val
            }];
        },
        male: convertTypeAndAccess,
        female: convertTypeAndAccess,
        unisex: convertTypeAndAccess
    },
    osm: {
        'addr:postcode': function(val) {
            return [{
                key: 'postcode',
                value: val
            }];
        },
        'addr:street': function(val, props) {
            var addr = [props['addr:street'], props['addr:city']];
            return [{
                key: 'streetAddress',
                value: _.compact(addr).join(', ')
            }];
        },
        'diaper': function(val){
            return [{
                key: 'babyChange',
                value: val
            }];
        },
        'baby_changing': function(val){
            return [{
                key: 'babyChange',
                value: val
            }];
        },
        'supervised': function(val) {
            return [{
                key: 'attended',
                value: val
            }];
        },
        'note': function(val) {
            return [{
                key: 'notes',
                value: val
            }];
        },
        'opening_hours': function(val) {
            return [{
                key: 'opening',
                value: val
            }];
        },
        'fee': function(val){
            return [{
                key: 'fee',
                value: val
            }];
        },
        'designation': function(val){
            if (val === 'destination') {
                return [{
                    key: 'access',
                    value: 'customers'
                }];
            }
        },
        'toilets:disposal': function(val){
            return [{
                key: 'disposal',
                value: val.toLowerCase()
            }];
        },
        'wheelchair': convertTypeAndAccess
    }
};


function transform(from) {
    var args = _.compact([{}, converters.base, converters[from]]);
    var converter = _.merge.apply(_, args);
    return through(function write(data){
        var props = {orig: data.properties};
        _.forOwn(booleanify(data.properties), function(val, key){
            var out;
            if (converter[key]) {
                out = converter[key](val, data.properties);
                if (out){
                    _.each(out, function(spec){
                        props[spec.key] = spec.value;
                    });
                }
            }
        });
        data.properties = props;
        this.queue(data);
    });
}

module.exports = function(items) {
    var out = through(),
        overlay = Array.prototype.slice.call(arguments, 1);
    items
        .pipe(transform(overlay))
        .pipe(out);
    return out;
};
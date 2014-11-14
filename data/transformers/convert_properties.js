var through = require('through'),
    _ = require('lodash'),
    oh = require('opening_hours');


var booleanify = function(data){
    return _.mapValues(data, function(val, key){
        try {
            if (_.isPlainObject(val)) { return booleanify(val); }
            if (_.isBoolean(val)) { return val; }
            if (_.indexOf(['true', 'yes', '1', 'y,'], val.toLowerCase()) !== -1) {
                return true;
            } else if (_.indexOf(['false', 'no', '0', 'no charge', 'n'], val.toLowerCase()) !== -1) {
                return false;
            } else {
                return val;
            }
        } catch (e) {
            throw "Broken val"+key+" : " + val + JSON.stringify(data);
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
        accessibilityType = (props.unisex) ? 'unisex55' : type || 'unisex';
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
        radar: function(val){
            return [{
                key: 'radar',
                value: val
            }];
        },
        operator: function(val){
            return [{
                key: 'operator',
                value: val
            }];
        },
        geocoded: function(val){
            return [{
                key: 'geocoded',
                value: val
            }];
        },
        geocoding_method: function(val){
            return [{
                key: 'geocoding_method',
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
    },
    nationalrail: {
        'wc available': function(val) {
            return [{
                key: 'active',
                value: !!val
            }];
        },
        'baby change available': function(val){
            return [{
                key: 'babyChange',
                value: !!val
            }];
        },
        'national key toilets available': function(val){
            return [{
                key: 'radar',
                value: !!val
            }];
        },
        'address line 1': function(val, props){
            var addr = [
                props['address line 1'], 
                props['address line 2'], 
                props['address line 3'],
                props['address line 4'],
                props['address line 5']
            ];
            return [{
                key: 'streetAddress',
                value: _.compact(addr).join(', ')
            }];
        }

    },
    gbptm: {
        'cost': function(val){
            return [{
                key: 'fee',
                value: val
            }];
        },
        'baby change': function(val){
            return [{
                key: 'babyChange',
                value: val
            }];
        },
        'provider': function(val){
            return [{
                key: 'operator',
                value: val
            }];
        },
        'toilet name': function(val, data){
            return [{
                key: 'name',
                value: val
            }];
        },
        'location of baby change': function(val){
            return [{
                key: 'babyChangeLocation',
                value: val
            }];
        },
        'attendant': function(val){
            return [{
                key: 'attended',
                value: val
            }];
        },
        'automatic?': function(val){
            return [{
                key: 'automatic',
                value: val
            }];
        },
        'car parking': function(val){
            return [{
                key: 'parking',
                value: val
            }];
        },
        'report problem': function(val){
            return [{
                key: 'reportPhone',
                value: val
            }];
        },
        'area': function(val, data){
            return [{
                key: 'streetAddress',
                value: _.compact([data.location, data.area]).join(', ')
            }];
        },
        'location': function(val, data){
            var out = [{
                key: 'streetAddress',
                value: _.compact([data.location, data.area]).join(', ')
            }];

            if (val && !data['toilet name']) {
                out.push({
                    key: 'name',
                    value: val
                });
            }

            return out;
        },
        '24 hours': function(val) {
            return [{
                key: 'opening',
                value: '24/7'
            }];
        },
        'open': function(val, data){
            var open = '', dow = '', notes = '';
            try {
                open = new oh(val.replace(/ - /g, '-').replace(/\./g, ':')).prettifyValue();
            } catch (e) {
                // nothing to do
            }
            if (data['days of the week open']) {
                try {
                    dow = new oh(data['days of the week open']).prettifyValue();
                } catch (e) {
                    //nothing to do
                }
            }
            if (data['time notes:']) {
                try {
                    notes = new oh(data['time notes:'].replace(/ - /g, '-').replace(/\./g, ':')).prettifyValue();
                } catch (e) {
                    // nope still nothing
                }
            }
            if ((dow + open + notes) !== '') {
                return [{
                    key: 'opening',
                    value: _.compact([dow, open, notes]).join(' ')
                }];
            }
        },
        'open season - summer': function(val, data){
            var opening = '', notes = '';
            if (data.open) { return; }
            try {
                return [{
                    key: 'opening',
                    value: 'summer '+ new oh(val.replace(/\./, ':').replace(/12pm/g, '12:00pm')).prettifyValue()
                }];
            } catch (e) {
                // natch
            }
            if (data['time notes:']) {
                try {
                    notes = new oh(data['time notes:'].replace(/ - /g, '-').replace(/\./g, ':')).prettifyValue();
                } catch (e) {
                    // nope still nothing
                }
            }

            if (opening + notes !== '') {
                return [{
                    key: 'opening',
                    value: _.compact([opening, notes]).join(' ')
                }];
            }
        }
    }
};


function transform(from) {
    var args = _.compact([{}, converters.base, converters[from]]);
    var converter = _.merge.apply(_, args);
    return through(function write(data){
        var props = {orig: data.properties},
            booled = booleanify(data.properties);
        _.forOwn(booled, function(val, key){
            var out;
            if (converter[key]) {
                out = converter[key](val, booled);
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
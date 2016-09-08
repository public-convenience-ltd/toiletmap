var _ = require('lodash')
var Oh = require('opening_hours')

module.exports = function (hbs) {
  var config = {
    loo_properties: {
      blacklist: ['orig', 'active', 'name', 'geocoded', 'geocoding_method', 'toObject'],
      ordering: ['access', 'type', 'accessibleType', 'opening', 'attended', 'babyChange', 'automatic', 'radar', 'fee', 'notes'],
      humanize_properties: {
        type: 'Facilities',
        accessibleType: 'Accessible facilities',
        babyChange: 'Baby Changing',
        attended: 'Attended',
        access: 'Who can access?',
        radar: 'Radar key',
        fee: 'Fee',
        removal_reason: 'Removed'
      },
      humanize_values: {
        'public': 'Public',
        'permissive': 'Public use permitted',
        'customer': 'Customer use only',
        'public,unisex': 'Unisex',
        '09:00-17:00': 'Business hours, Mon-Sun',
        'Mo-Fr 09:00-17:00': 'Business hours, Mon-Fri',
        '17:00-00:00': 'Evening only',
        '09:00-18:00': 'Daylight hours only'
      },
      options: {
        opening: [
          {
            opt: '24/7',
            val: '24/7'
          },
          {
            opt: 'Business hours, Mon-Sun',
            val: '09:00-17:00'
          },
          {
            opt: 'Business hours, Mon-Fri',
            val: 'Mo-Fr 09:00-17:00'
          },
          {
            opt: 'Evening only',
            val: '17:00-00:00'
          },
          {
            opt: 'Daylight hours only',
            val: '09:00-18:00'
          },
          {
            opt: 'Other',
            val: ''
          }
        ],
        type: [
          {
            opt: 'Female',
            val: 'female'
          },
          {
            opt: 'Male',
            val: 'male'
          },
          {
            opt: 'Female and Male',
            val: 'female and male'
          },
          {
            opt: 'Unisex',
            val: 'unisex'
          },
          {
            opt: 'Male Urinal',
            val: 'male urinal'
          },
          {
            opt: 'Children Only',
            val: 'children only'
          },
          {
            opt: 'None',
            val: 'none'
          }
        ],
        access: [
          {
            opt: 'Public',
            val: 'public'
          },
          {
            opt: 'Non-customers permitted',
            val: 'permissive'
          },
          {
            opt: 'Customers only',
            val: 'customers only'
          }
        ]
      }
    }
  }

  var checkers = {
    cost: function (loo) {
      if (_.isUndefined(loo.properties.fee) || _.isNull(loo.properties.fee)) { return null }
      return loo.properties.fee ? false : true
    },
    accessible: function (loo) {
      if (_.isUndefined(loo.properties.accessibleType) || _.isNull(loo.properties.accessibleType)) { return null }
      return (loo.properties.accessibleType !== 'none') ? true : false
    },
    open: function (loo) {
      if (_.isUndefined(loo.properties.opening) || _.isNull(loo.properties.opening) || !loo.properties.opening) { return null }
      return new Oh(loo.properties.opening).getState()
    },
    male: function (loo) {
      if (_.isUndefined(loo.properties.type) || _.isNull(loo.properties.type)) { return null }
      return /\bmale\b|unisex/.test(loo.properties.type)
    },
    female: function (loo) {
      if (_.isUndefined(loo.properties.type) || _.isNull(loo.properties.type)) { return null }
      return /\bfemale\b|unisex/.test(loo.properties.type)
    },
    babychanging: function (loo) {
      if (_.isUndefined(loo.properties.babyChange) || _.isNull(loo.properties.babyChange)) { return null }
      return loo.properties.babyChange
    }
  }
  function checkpref (loo, pref, setting) {
    if (!setting) { return }
    return checkers[pref] ? checkers[pref](loo) : loo.properties[pref]
  }

  function booleanize (val) {
    var trueOutput = 'Yes'
    var falseOutput = 'No'
    if (_.isNumber(val) && val === 0) {
      val = false
    }
    if (_.indexOf(['true', 'false', '0'], val) !== -1) {
      val = (val === 'true')
    }
    if (_.isBoolean(val)) {
      return val ? trueOutput : falseOutput
    } else {
      return val ? val : 'Not known'
    }
  }

  function capitalize (val) {
    return val.replace(/([A-Z])/g, ' $1')
      .replace(/^./, function (str) {
        return str.toUpperCase()
      })
      .trim()
  }

  return {
    loo_property: function (item) {
      if (item[1] === null) {
        return null
      }
      var partial = hbs.partials[item[0] + '_looProperty'] || hbs.partials.default_looProperty
      return new hbs.SafeString(hbs.compile(partial)({key: item[0], value: item[1]}))
    },
    sort_properties: function (context, options) {
      return _(_.clone(context))
        .omit(config.loo_properties.blacklist)
        .toPairs()
        .sortBy(function (item) {
          var dex = _.indexOf(config.loo_properties.ordering, item[0])
          return (dex !== -1) ? dex : config.loo_properties.ordering.length + 1
        })
        .map(options.fn)
        .value()
        .join('')
    },
    geo2leaflet: function (coords) {
      return new hbs.SafeString(JSON.stringify(coords.slice().reverse()))
    },
    json: function (obj) {
      return new hbs.SafeString(JSON.stringify(obj))
    },
    selected: function (option, value) {
      if (option === value) {
        return ' selected'
      } else {
        return ''
      }
    },
    checked: function (option, value) {
      if (option === value) {
        return ' checked'
      } else {
        return ''
      }
    },
    options: function (values, current, hboptions) {
      var items = _.cloneDeep(config.loo_properties.options[values])
      if (current) {
        var cur = _.find(items, {val: current})
        if (cur) {
          cur.selected = true
        } else {
          items.push({
            opt: current,
            val: current,
            selected: true
          })
        }
      }
      return _.map(items, hboptions.fn).join('')
    },
    booleanize: booleanize,
    plusone: function (val) {
      return val + 1
    },
    humanize_property: function (prop, val) {
      var output = config.loo_properties.humanize_properties[prop] || capitalize(prop)
      var isBoolean = _.indexOf(['Yes', 'No', 'Not known'], booleanize(val)) !== -1
      return isBoolean ? output + '?' : output
    },
    humanize_value: function (val) {
      var value = booleanize(val)
      return config.loo_properties.humanize_values[value] || value
    },
    preferred: function (loo, loo_preferences) {
      var status = 'a toilet'
      var details

      if (loo_preferences) {
        details = _.map(loo_preferences, function (val, key) {
          return checkpref(loo, key, val)
        })
        if (_.every(details, Boolean)) {
          status = 'a preferred toilet'
      } else if (_.includes(details, false)) {
          status = 'not a preferred toilet'
        }
      }
      return status
    },
    pref_icons: function (loo, prefs, options) {
      var sources = []
      _.each(prefs, function (v, pref) {
        var tf = checkpref(loo, pref, v)
        if (_.isBoolean(tf)) {
          sources.push({
            pref: pref,
            status: tf.toString()
          })
        }
      })
      return _.map(sources, options.fn).join('')
    },
    join: function (items, sep) {
      return items.join(sep)
    },
    rating: function (credibility) {
      var output = ''
      var theScore = Math.ceil((credibility || 0) / 4)
      var i
      for (i = 1; i <= 5; i++) {
        if (i <= theScore) {
          output += '<span class="green" aria-hidden>&#x2605;</span> '
        } else {
          output += '<span class="grey" aria-hidden>&#x2605;</span> '
        }
      }
      return new hbs.SafeString(output + '<small>(' + theScore + ' out of 5)</small>')
    }
  }
}

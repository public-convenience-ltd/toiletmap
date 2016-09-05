var $ = require('jquery')
var _ = require('lodash')
var L = require('leaflet')
var getobject = require('getobject')
var Handlebars = require('hbsfy/runtime')
var helpers = require('./helpers.js')(Handlebars)
var knn = require('leaflet-knn')
require('leaflet.markercluster')
require('leaflet-control-geocoder')
require('leaflet-loading')
require('leaflet.locatecontrol')
require('jquery-ajax-transport-xdomainrequest')
L.Icon.Default.imagePath = '/images/'

var Cookies = require('js-cookie')

_.each(helpers, function (helper, name) {
  Handlebars.registerHelper(name, helper)
})
Handlebars.registerPartial('notes_looProperty', require('./views/partials/notes_looProperty.hbs'))
Handlebars.registerPartial('default_looProperty', require('./views/partials/default_looProperty.hbs'))

var gbptm = {
  templates: {
    loolist: require('./views/partials/loolist.hbs')
  },
  config: {
    macromap: {
      identStart: '&#49' // &#65
    }
  },
  $: $
}

gbptm.configure = function (cfg) {
  _.defaults(gbptm.config, cfg)
}

L.LooIcon = L.Icon.Default.extend({
  iconUrl: L.Icon.Default.imagePath + 'marker-icon.png',
  iconRetinaUrl: L.Icon.Default.imagePath + 'marker-icon-2x.png'
})

L.LooIdentIcon = L.Icon.Default.extend({
  options: {
    iconUrl: L.Icon.Default.imagePath + 'marker-ident-icon.png',
    iconRetinaUrl: L.Icon.Default.imagePath + 'marker-ident-icon-2x.png',
    ident: ''
  },

  createIcon: function () {
    var div = document.createElement('div')
    var img = this._createImg(this.options.iconUrl)
    var identdiv = document.createElement('div')
    identdiv.setAttribute('class', 'ident')
    identdiv.innerHTML = this.options.ident || ''
    div.appendChild(img)
    div.appendChild(identdiv)
    this._setIconStyles(div, 'icon')
    return div
  }
})

gbptm.nearest = function () {
  var center = gbptm.macromap.getCenter()
  var listing = $('#loolist')
  listing.replaceWith(gbptm.templates.loolist({
    loos: _.map(
      gbptm.macromap.index(center.lat, center.lng, 5, 50000),
      function (marker) {
        return marker.layer.feature
      }),
    prefs: gbptm.prefs()
  }))
  gbptm.scan('#loolist')
  gbptm.macromap.refreshMarkers(gbptm.makeIdentMap())
}

gbptm.makeIdentMap = function () {
  var identMap = {}
  var start = parseInt(gbptm.config.macromap.identStart.slice(-2), 10)
  var charPrefix = gbptm.config.macromap.identStart.slice(0, -2)
  $('[data-map_ident]').each(function (i, v) {
    var kv = $(v).data('map_ident').split(':')
    identMap[kv[0]] = charPrefix + (start + parseInt(kv[1], 10) - 1)
  })
  return identMap
}

gbptm.multi_loo_map = function (el, opts) {
  var map = L.map(el, {
    zoom: opts.zoom,
    minZoom: 12,
    maxZoom: 18
  })
  map.setView(opts.center, opts.zoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map)

  var markers = new L.MarkerClusterGroup({
    showCoverageOnHover: false,
    disableClusteringAtZoom: 15,
    iconCreateFunction: function (cluster) {
      return new L.DivIcon({ html: '<div class="cluster">' + cluster.getChildCount() + '<span>toilets</span></div>' })
    }
  })

  map.addLayer(markers)

  var geocoder = L.Control.geocoder({
    geocoder: new L.Control.Geocoder.nominatim({ // eslint-disable-line new-cap
      geocodingQueryParams: {
        countrycodes: 'gb' // will start workin on next release of geocoder control
      }
    }),
    collapsed: false,
    placeholder: 'Placename or postcode...'
  }).addTo(map)
  $(geocoder._container).on('click', '.leaflet-control-geocoder-icon', function (evt) {
    geocoder._geocode(evt)
  })
  geocoder.markGeocode = function (result) {
    this._map.setView(result.center)
    return this
  }

  L.Control.loading({separate: true}).addTo(map)

  var locateControl = L.control.locate({
    drawCircle: true,
    follow: true,
    keepCurrentZoomLevel: true,
    icon: 'icon-location',
    iconLoading: 'icon-location',
    showPopup: false,
    onLocationError: $.noop,
    onLocationOutsideMapBounds: $.noop
  }).addTo(map)
  map.on('dragstart', locateControl._stopFollowing, locateControl)

  if (opts.locate) {
    locateControl.start()
  }

  map.refreshMarkers = function (identMap) {
    var geoJsonLayer = L.geoJson(map.loos, {
      pointToLayer: function (feature, latlng) {
        var ident = identMap ? identMap[feature._id] || '' : ''
        var icon
        if (ident) {
          icon = new L.LooIdentIcon({ident: ident})
        } else {
          icon = new L.LooIcon()
        }
        return new L.Marker(latlng, {
          icon: icon
        })
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function (evt) {
          window.location.pathname = '/loos/' + evt.target.feature._id
        })
      }
    })
    markers.clearLayers()
    markers.addLayer(geoJsonLayer)
    this.index = knn(geoJsonLayer)
  }

  var refreshLoos = _.debounce(function (bounds) {
    var hw = map.highwater
    if (!hw || !hw.contains(bounds)) {
      hw = bounds.pad(0.1)
      map.fireEvent('dataloading')
      var coords = [hw.getSouthWest(), hw.getNorthEast(), hw.getNorthWest(), hw.getSouthEast()]
      var bbox = $.map(coords, function (point) { return point.lng + ',' + point.lat })

      $.ajax({
        url: gbptm.config.api + '/loos/in/' + bbox.join('/'),
        dataType: 'json'
      }).done(function (data) {
        map.highwater = hw
        map.loos = data
        map.refreshMarkers(gbptm.makeIdentMap())
        gbptm.nearest()
        map.fireEvent('dataload')
      })
    } else {
      gbptm.nearest()
    }
  }, 1500, {leading: true, trailing: true})

  map.on('moveend', function () {
    refreshLoos(map.getBounds())
  })
  refreshLoos(map.getBounds())

  gbptm.macromap = map
  return map
}

gbptm.bindLonLat = function (lonel, latel) {
  function reportCenter (evt) {
    var center = evt.target.getCenter()
    lonel.val(center.lng)
    latel.val(center.lat)
  }
  var monitor = gbptm.macromap || gbptm.micromap
  if (monitor) {
    monitor.on('moveend', reportCenter)
    monitor.on('load', reportCenter)
    reportCenter({target: monitor})
  }
}

gbptm.mini_map = function (el, opts) {
  var map = L.map(el, {
    attributionControl: false,
    keyboard: false,
    tap: false,
    dragging: false,
    zoomControl: opts.zoomable || false,
    touchZoom: opts.zoomable || false,
    scrollWheelZoom: opts.zoomable || false,
    doubleClickZoom: opts.zoomable || false,
    maxZoom: 18,
    minZoom: 12
  })
  map.setView(opts.center, opts.zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)
  L.marker(opts.center, {
    icon: new L.LooIdentIcon({ident: $(el).data('map_ident').split(':')[1]})
  }).addTo(map)
  return map
}

gbptm.positioning_map = function (el, opts) {
  var map = L.map(el, {
    attributionControl: false,
    keyboard: true,
    tap: true,
    dragging: true,
    zoomControl: true,
    touchZoom: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    maxZoom: 18,
    minZoom: 10
  })
  map.setView(opts.center, opts.zoom)
  var locateControl = L.control.locate({
    drawCircle: false,
    follow: true,
    keepCurrentZoomLevel: true,
    showPopup: false,
    onLocationError: $.noop,
    onLocationOutsideMapBounds: $.noop
  }).addTo(map)
  map.on('dragstart', locateControl.stopFollowing)
  locateControl.start()
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(map)
  gbptm.micromap = map
  return map
}

gbptm.setpref = function (prefpath, val) {
  var prefs = gbptm.prefs()
  getobject.set(prefs, prefpath, val)
  Cookies.set('prefs', JSON.stringify(prefs), { expires: 365, path: '/' })
}

gbptm.prefs = function () {
  return JSON.parse(Cookies.get('prefs') || '{}')
}

gbptm.prefbox = function (el, opts) {
  $(el).on('change', function (evt) {
    gbptm.setpref(opts.pref, $(evt.currentTarget).is(':checked'))
  })
}

gbptm.hide_help = function (el, opts) {
  $(el).on('click', function (evt) {
    gbptm.setpref(opts.setpref, true)
    $(this).closest(opts.target).hide('slow')
  })
}

gbptm.scan = function (scope) {
  var gbptm = this
  $('[data-init|=gbptm]:visible', scope).each(function () {
    var tgt = $(this)
    var opts = _.transform(tgt.data(), function (res, v, k) {
      if (/^config_/.test(k)) {
        res[k.split('_')[1]] = v
      }
    }, {})
    gbptm[tgt.data('init').substring(6)](this, _.defaults(opts, gbptm.config.map))
  })
}

gbptm.supports_geolocation = (function () {
  return 'geolocation' in navigator
})()

gbptm.locate_and_redirect = function () {
  function located (pos) {
    window.location.pathname = '/loos/near/' + pos.coords.longitude + '/' + pos.coords.latitude
  }
  // Relocate if we're not showing a map
  if (this.supports_geolocation && !$('[role="complementary"]').is(':visible')) {
    navigator.geolocation.getCurrentPosition(located, $.noop)
  }
}

module.exports = gbptm

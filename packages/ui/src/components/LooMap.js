import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import L from 'leaflet';

import { Map, TileLayer, MapControl, Marker } from 'react-leaflet';

import 'leaflet.markercluster';
import 'leaflet.locatecontrol';
import 'leaflet.fullscreen';
import 'leaflet-loading';

// Import source file instead of by module name to avoid Webpack warning
// https://github.com/perliedman/leaflet-control-geocoder/issues/150
import 'leaflet-control-geocoder/src';

import config from '../config.js';

import styles from './css/loo-map.module.css';

import markerIcon from '../images/marker-icon.png';
import markerIconRetina from '../images/marker-icon-2x.png';
import markerIconHighlight from '../images/marker-icon-highlight.png';
import markerIconRetinaHighlight from '../images/marker-icon-highlight-2x.png';
import markerCircle from '../images/map-icons/circle.svg';

L.LooIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    highlight: false,
  },

  initialize: function(options) {
    if (options.highlight) {
      // Add highlight properties
      this.options = {
        ...this.options,
        iconUrl: markerIconHighlight,
        iconRetinaUrl: markerIconRetinaHighlight,
        className: styles.markerHighlighted,
      };
    } else {
      this.options = {
        ...this.options,
        iconUrl: markerIcon,
        iconRetinaUrl: markerIconRetina,
      };
    }

    L.Util.setOptions(this, options);
  },

  createIcon: function() {
    // do we need to be complex to show an index, or are we just a dumb image
    if (!this.options.index) {
      var img = this._createImg(this._getIconUrl('icon'));
      this._setIconStyles(img, 'icon');
      return img;
    }

    // make the parent with the image
    var grouper = document.createElement('div');
    grouper.style.background = `url('${this._getIconUrl('icon')}')`;
    grouper.style.backgroundSize = '100% 100%';
    this._setIconStyles(grouper, 'icon');

    // make an index label
    var index = document.createElement('div');
    index.setAttribute('class', styles.index);
    index.innerHTML = this.options.index;
    grouper.appendChild(index);

    return grouper;
  },
});

export class GeolocationMapControl extends MapControl {
  componentWillMount() {
    var control = L.Control.geocoder({
      // eslint-disable-next-line new-cap
      geocoder: new L.Control.Geocoder.nominatim({
        geocodingQueryParams: {
          // Experimental and currently not working
          // http://wiki.openstreetmap.org/wiki/Nominatim#Parameters
          countrycodes: 'gb',
        },
      }),
      collapsed: true,
      placeholder: 'Placename or postcode...',
    });

    control.markGeocode = function(result) {
      this._map.setView(result.geocode.center);

      return this;
    };

    this.leafletElement = control;
  }
}

export class LocateMapControl extends MapControl {
  componentWillMount() {
    var control = L.control.locate({
      drawCircle: true,
      follow: true,
      keepCurrentZoomLevel: true,
      icon: styles.locate,
      iconLoading: styles.locate,
      showPopup: false,
      onLocationError: Function.prototype,
      onLocationOutsideMapBounds: Function.prototype,
    });

    this.leafletElement = control;
  }
}

export class FullscreenMapControl extends MapControl {
  componentWillMount() {
    var control = L.control.fullscreen({
      forceSeparateButton: true,
    });

    this.leafletElement = control;
  }
}

export class LooMap extends Component {
  constructor(props) {
    super(props);

    this.onZoom = this.onZoom.bind(this);

    this.onMove = _.debounce(this.onMove.bind(this), 500, {
      leading: false,
      trailing: true,
    });

    // Set initial state
    this.state = {
      clusterLayer: null,
    };

    this.onMarkerClick = this.onMarkerClick.bind(this);
  }

  componentDidMount() {
    // Diffiult to determine when `ref` is set since we need to wait for the `Map`
    // child component lifecycle to complete
    //
    // `setTimeout, 0` was not sufficient for both tests and browser
    //
    // https://github.com/tomchentw/react-google-maps/issues/122
    // https://github.com/facebook/react/issues/5053
    if (this.refs.map && this.refs.map.leafletElement) {
      var map = (this.leafletElement = this.refs.map.leafletElement);
      var center = map.getCenter();

      // Create a marker cluster layer which will be reset each time this
      // component receives props
      var clusterLayer = L.markerClusterGroup({
        showCoverageOnHover: false,
        disableClusteringAtZoom: 15,
        iconCreateFunction: cluster => {
          var count = cluster.getChildCount();

          return L.divIcon({
            html: `<div class=${styles.cluster}>
                              <span class=${styles.count}>${count}</span>
                              toilets
                          </div>`,
          });
        },
      });

      this.leafletElement.addLayer(clusterLayer);

      // Set state and, afterwards, add loo markers
      this.setState({
        clusterLayer,
        markers: {},
      });
    }

    this.props.onInitialised(map);
    this.props.onUpdateCenter(center);
  }

  onMove(event) {
    var map = this.leafletElement;
    var center = map.getCenter();

    this.props.onUpdateCenter(center);
    this.props.onMove(center.lng, center.lat);
  }

  onZoom(event) {
    var zoom = this.leafletElement.getZoom();

    this.props.onZoom(zoom);
  }

  onMarkerClick(loo) {
    if (this.props.activeMarkers) {
      this.props.history.push('/loos/' + loo._id);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // New cluster layer, we probably remounted
    if (prevState.clusterLayer !== this.state.clusterLayer) {
      // We need to re-add everything
      this.addRemoveMarkers(_.keyBy(this.props.loos, '_id'), {});
      return;
    }

    // Otherwise, we only care if markers and their icons could've changed
    if (
      prevProps.loos === this.props.loos &&
      prevProps.highlight === this.props.highlight &&
      prevProps.countLimit === this.props.countLimit &&
      prevProps.countFrom === this.props.countFrom
    ) {
      return;
    }

    let loosThen = _.keyBy(prevProps.loos, '_id');
    let loosNow = _.keyBy(this.props.loos, '_id');

    // Remove elements that have unchanged location from both, effectively
    // diff'ing; this will leave us with markers to remove in loosThen and
    // markers to add in loosNow
    for (let id of Object.keys(loosNow)) {
      // Can a loo's marker (not including icon) be left untouched?
      if (
        loosThen.hasOwnProperty(id) &&
        loosThen[id].geohash === loosNow[id].geohash
      ) {
        // Yes, we don't need to update these; same loo in the same place
        delete loosThen[id];
        delete loosNow[id];
      }
    }

    // Update the markers as appropriate
    this.addRemoveMarkers(loosNow, loosThen);
  }

  addRemoveMarkers(loosToAdd, loosToRemove) {
    // Assumes loosToAdd and loosToRemove have already been checked for duplicates
    const markers = { ...this.state.markers };

    // Remove markers in bulk
    const markersToRemove = [];
    for (const id of Object.keys(loosToRemove)) {
      markersToRemove.push(markers[id]);
      delete markers[id];
    }
    this.state.clusterLayer.removeLayers(markersToRemove);

    // Add markers in bulk
    const markersToAdd = [];
    for (let [id, loo] of Object.entries(loosToAdd)) {
      // Determine whether to highlight the current loo instance
      var highlight = this.props.highlight && loo._id === this.props.highlight;

      var position = {
        lat: loo.geometry.coordinates[1],
        lng: loo.geometry.coordinates[0],
      };

      var icon = new L.LooIcon({ highlight });
      var marker = L.marker(position, { icon }); // We'll work out numbering below

      // Individual marker click handler
      marker.on('click', _.partial(this.onMarkerClick, loo));
      markersToAdd.push(marker);
      markers[id] = marker;
    }
    this.state.clusterLayer.addLayers(markersToAdd);

    // Update icons to reflect appropriate number and highlight status
    for (let i = 0; i < this.props.loos.length; i++) {
      const loo = this.props.loos[i];

      let index = undefined;
      if (this.props.countLimit && i < this.props.countLimit) {
        index = this.props.countFrom + i;
      }

      let highlight = false;
      if (this.props.highlight && loo._id === this.props.highlight) {
        highlight = true;
      }

      // Do we need to change the icon based on properties then and now?
      const iconOptionsNow = markers[loo._id].options.icon.options;
      if (
        iconOptionsNow.index !== index ||
        iconOptionsNow.highlight !== highlight
      ) {
        markers[loo._id].setIcon(
          new L.LooIcon({
            highlight,
            index,
          })
        );
      }
    }

    // Cache markers for each loo
    this.setState({
      ...this.state,
      markers,
    });
  }

  render() {
    // Center point for the map view
    var center = this.props.initialPosition;

    if (this.leafletElement) {
      center = this.leafletElement.getCenter();
    }

    var className = this.props.className;
    if (this.props.showCrosshair) {
      className += ` ${styles['with-crosshair']}`;
      className += ' map--zindexfix';
    }

    // `minZoom` and `maxZoom` needed on `Map` Component for clustering and `TileLayer` for `react-leaflet`
    return (
      <Map
        ref="map"
        center={this.props.initialPosition}
        zoom={this.props.initialZoom}
        zoomControl={!this.props.preventZoom && this.props.showZoomControls}
        scrollWheelZoom={!this.props.preventZoom}
        dragging={!this.props.preventDragging}
        className={className}
        onMove={this.onMove}
        onZoomend={this.onZoom}
        minZoom={this.props.minZoom}
        maxZoom={this.props.maxZoom}
        loadingControl={true}
        tap={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          minZoom={this.props.minZoom}
          maxZoom={this.props.maxZoom}
          attribution={
            this.props.showAttribution
              ? 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              : ''
          }
        />

        {this.props.showSearchControl && <GeolocationMapControl />}
        {this.props.showLocateControl && <LocateMapControl />}
        {this.props.showFullscreenControl && <FullscreenMapControl />}

        {this.props.showCenter &&
          center && (
            <Marker
              position={center}
              icon={L.icon({
                iconSize: [16, 16],
                iconAnchor: [8, 8],
                iconUrl: markerCircle,
                className: styles.center,
              })}
            />
          )}
      </Map>
    );
  }
}

LooMap.propTypes = {
  // An array of loo instances to be represented as map markers, assumed to be from closest to furthest away
  loos: PropTypes.array.isRequired,

  // Optional CSS class name to override the map element styles
  className: PropTypes.string,

  // http://leafletjs.com/reference.html#latlng
  initialPosition: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
  ]).isRequired,

  initialZoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  preventZoom: PropTypes.bool,
  preventDragging: PropTypes.bool,
  showSearchControl: PropTypes.bool,
  showLocateControl: PropTypes.bool,
  showFullscreenControl: PropTypes.bool,
  showAttribution: PropTypes.bool,

  // Label loo markers with icons from a starting number, for a limited number of loos
  countFrom: PropTypes.number,
  countLimit: PropTypes.number,

  // Note this also has a dependency on `preventZoom`
  showZoomControls: PropTypes.bool,

  // Draws a circle to indicate the center of the map
  showCenter: PropTypes.bool,

  // Callback fn called with the new `lat`, `lng` and `radius` values.
  // Fired when the view of the map stops changing (e.g. user stopped dragging the map)
  onMove: PropTypes.func,

  // Callback fn called with the new `zoom` level.
  // Fired once the user has finished zooming
  onZoom: PropTypes.func,

  // Callback fn called with a reference to the leaflet element.
  // Fired once the component has mounted
  onInitialised: PropTypes.func,

  // Shows a crosshair at the center of the map
  showCrosshair: PropTypes.bool,

  // Called on `onMove` and `onInitialised`
  onUpdateCenter: PropTypes.func,

  // Loo id to highlight
  highlight: PropTypes.string,

  activeMarkers: PropTypes.bool,
};

LooMap.defaultProps = {
  loos: [],
  className: styles.map,
  initialZoom: config.initialZoom,
  minZoom: config.minZoom,
  maxZoom: config.maxZoom,
  preventZoom: false,
  preventDragging: false,
  showSearchControl: false,
  showLocateControl: false,
  showFullscreenControl: false,
  showZoomControls: true,
  showAttribution: false,
  showCenter: false,
  showCrosshair: false,
  countLimit: 10,
  onMove: Function.prototype,
  onZoom: Function.prototype,
  onInitialised: Function.prototype,
  onUpdateCenter: Function.prototype,
  activeMarkers: true,
};

export default withRouter(LooMap);

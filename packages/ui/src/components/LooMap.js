import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import L from 'leaflet';
import path from 'path';

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

L.Icon.Default.imagePath = path.resolve('../images');

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

      if (this.props.shouldCluster) {
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

        this.setState({
          clusterLayer,
        });
      }

      this.props.onInitialised(map);
      this.props.onUpdateCenter(center);
    }
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

  render() {
    // Center point for the map view
    var center = this.props.initialPosition;

    if (this.leafletElement) {
      center = this.leafletElement.getCenter();
    }

    // Clone `loos` to avoid props mutation
    var looList = this.props.loos.slice(0);

    // Cluster
    // Manually adds markers by directly calling the Leaflet API instead of using the `react-leaflet`
    // `Marker` component
    if (this.props.shouldCluster && this.state.clusterLayer) {
      this.state.clusterLayer.clearLayers();

      looList.forEach(loo => {
        // Determine whether to highlight the current loo instance
        var highlight =
          this.props.highlight && loo._id === this.props.highlight;

        var position = {
          lat: loo.geometry.coordinates[1],
          lng: loo.geometry.coordinates[0],
        };

        var marker = L.marker(position, {
          icon: L.icon({
            iconSize: [25, 41],
            iconAnchor: [12.5, 41],
            iconUrl: highlight ? markerIconHighlight : markerIcon,
            iconRetinaUrl: highlight
              ? markerIconRetinaHighlight
              : markerIconRetina,
            className: highlight && styles.markerHighlighted,
          }),
        });

        // Individual marker click handler
        marker.on('click', _.partial(this.onMarkerClick, loo));

        this.state.clusterLayer.addLayer(marker);
      });

      this.leafletElement.addLayer(this.state.clusterLayer);
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
        className={
          this.props.className +
          (this.props.showCrosshair ? ' ' + styles.crosshaired : '')
        }
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

        {/* Render individual Marker Components if we're not clustering */}
        {!this.props.shouldCluster &&
          looList.map((loo, index) => {
            // Determine whether to highlight the current loo instance
            var highlight =
              this.props.highlight && loo._id === this.props.highlight;

            return (
              <Marker
                key={index}
                position={[
                  loo.geometry.coordinates[1],
                  loo.geometry.coordinates[0],
                ]}
                icon={L.icon({
                  iconSize: [25, 41],
                  iconAnchor: [12.5, 41],
                  iconUrl: highlight ? markerIconHighlight : markerIcon,
                  iconRetinaUrl: highlight
                    ? markerIconRetinaHighlight
                    : markerIconRetina,
                })}
                onClick={_.partial(this.onMarkerClick, loo)}
              />
            );
          })}

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
  // An array of loo instances to be represented as map markers
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

  // Allows markers to form clusters using the 'leaflet.markercluster' plugin
  shouldCluster: PropTypes.bool,

  initialZoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  preventZoom: PropTypes.bool,
  preventDragging: PropTypes.bool,
  showSearchControl: PropTypes.bool,
  showLocateControl: PropTypes.bool,
  showFullscreenControl: PropTypes.bool,
  showAttribution: PropTypes.bool,

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
  shouldCluster: false,
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
  onMove: Function.prototype,
  onZoom: Function.prototype,
  onInitialised: Function.prototype,
  onUpdateCenter: Function.prototype,
  activeMarkers: true,
};

export default withRouter(LooMap);

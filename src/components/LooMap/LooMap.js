import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import L from 'leaflet';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import CustomControl from 'react-leaflet-control';

import config from '../../config.js';
import LocateMapControl from './LocateMapControl';
import MarkerClusterGroup from './MarkerClusterGroup';
import LooIcon from './LooIcon';
import LocationSearch from '../LocationSearch';

import styles from '../css/loo-map.module.css';

const LooMap = (props) => {
  const mapRef = React.useRef();

  const handleViewportChanged = () => {
    const map = mapRef.current.leafletElement;

    const center = map.getCenter();
    const zoom = map.getZoom();

    const bounds = map.getBounds();
    const radius = parseInt(bounds.getNorthEast().distanceTo(center));

    props.onViewportChanged({
      center,
      zoom,
      radius,
    });
  };

  const className = props.showCenter
    ? `${props.className} ${styles['with-crosshair']} map--zindexfix`
    : props.className;

  return (
    <Map
      ref={mapRef}
      className={className}
      center={props.center}
      zoom={props.zoom}
      minZoom={props.minZoom}
      maxZoom={props.maxZoom}
      onViewportChanged={handleViewportChanged}
      dragging={!props.preventDragging}
      scrollWheelZoom={!props.preventZoom}
      zoomControl={false}
      tap={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        minZoom={props.minZoom}
        maxZoom={props.maxZoom}
        contributor={
          props.showContributor
            ? 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            : ''
        }
      />

      <MarkerClusterGroup
        iconCreateFunction={(cluster) =>
          L.divIcon({
            html: `
              <div class=${styles.cluster}>
                <span
                  class=${styles.count}
                >${cluster.getChildCount()}</span> toilets
              </div>
            `,
          })
        }
        showCoverageOnHover={false}
        disableClusteringAtZoom={15}
      >
        {props.loos.map((loo, i) => (
          <Marker
            key={loo.id}
            position={loo.location}
            icon={
              new LooIcon({
                highlight: loo.isHighlighted,
                looId: loo.id,
                label: props.markerLabel ? props.markerLabel(i) : undefined,
              })
            }
            onClick={() => {
              if (props.interactiveMarkers) {
                props.history.push('/loos/' + loo.id);
              }
            }}
          />
        ))}
      </MarkerClusterGroup>

      {props.showSearchControl && (
        <CustomControl position="topleft">
          <LocationSearch
            onSelectedItemChange={(center) =>
              props.onSearchSelectedItemChange({
                center,
              })
            }
          />
        </CustomControl>
      )}

      {props.showZoomControl && <ZoomControl position="bottomright" />}
      {props.showLocateControl && <LocateMapControl position="bottomright" />}
    </Map>
  );
};

LooMap.propTypes = {
  // An array of loo instances to be represented as map markers
  loos: PropTypes.array.isRequired,

  // Optional CSS class name to override the map element styles
  className: PropTypes.string,

  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,

  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  preventZoom: PropTypes.bool,
  preventDragging: PropTypes.bool,
  showSearchControl: PropTypes.bool,
  showLocateControl: PropTypes.bool,
  showContributor: PropTypes.bool,
  onViewportChanged: PropTypes.func,

  onSearchSelectedItemChange: PropTypes.func,

  // Note this also has a dependency on `preventZoom`
  showZoomControl: PropTypes.bool,

  // Draws a crosshair to indicate the center of the map
  showCenter: PropTypes.bool,

  // Returns the label for markers
  markerLabel: PropTypes.func,

  interactiveMarkers: PropTypes.bool,
};

LooMap.defaultProps = {
  loos: [],
  className: styles.map,
  zoom: config.initialZoom,
  minZoom: config.minZoom,
  maxZoom: config.maxZoom,
  onViewportChanged: Function.prototype,
  onSearchSelectedItemChange: Function.proptypes,
  preventZoom: false,
  preventDragging: false,
  showSearchControl: false,
  showLocateControl: false,
  showZoomControl: true,
  showContributor: false,
  showCenter: false,
  interactiveMarkers: true,
};

export default withRouter(LooMap);

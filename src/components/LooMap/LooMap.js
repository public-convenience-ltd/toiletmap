import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';

import config from '../../config.js';
import LocateMapControl from './LocateMapControl';
import ToiletMarkerIcon from './ToiletMarkerIcon';

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

  const { push } = useHistory();

  const toiletMarkers = React.useMemo(
    () =>
      props.loos.map((toilet) => (
        <Marker
          key={toilet.id}
          position={toilet.location}
          icon={
            new ToiletMarkerIcon({
              highlight: toilet.isHighlighted,
              toiletId: toilet.id,
            })
          }
          onClick={() => {
            if (props.interactiveMarkers) {
              push('/loos/' + toilet.id);
            }
          }}
        />
      )),
    [props.loos, props.interactiveMarkers, push]
  );

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

      {toiletMarkers}

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

export default LooMap;

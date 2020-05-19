import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { css } from '@emotion/core';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';

import config from '../../config.js';
import LocateMapControl from './LocateMapControl';
import ToiletMarkerIcon from './ToiletMarkerIcon';

const LooMap = ({
  center,
  zoom,
  minZoom,
  maxZoom,
  onViewportChanged,
  loos,
  staticMap,
  controlsOffset,
}) => {
  const mapRef = React.useRef();

  const handleViewportChanged = () => {
    const map = mapRef.current.leafletElement;

    const center = map.getCenter();
    const zoom = map.getZoom();

    const bounds = map.getBounds();
    const radius = parseInt(bounds.getNorthEast().distanceTo(center));

    onViewportChanged({
      center,
      zoom,
      radius,
    });
  };

  const { push } = useHistory();

  const memoizedMarkers = React.useMemo(
    () =>
      loos.map((toilet) => (
        <Marker
          key={toilet.id}
          position={toilet.location}
          zIndexOffset={toilet.isHighlighted ? 1000 : 0}
          icon={
            new ToiletMarkerIcon({
              isHighlighted: toilet.isHighlighted,
              toiletId: toilet.id,
            })
          }
          onClick={() => {
            if (!staticMap) {
              push('/loos/' + toilet.id);
            }
          }}
        />
      )),
    [loos, staticMap, push]
  );

  return (
    <Map
      ref={mapRef}
      center={center}
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      onViewportChanged={handleViewportChanged}
      dragging={!staticMap}
      scrollWheelZoom={!staticMap}
      zoomControl={false}
      tap={false}
      css={css`
        height: 100%;
        width: 100%;
        position: relative;
        z-index: 0;

        .leaflet-bottom {
          bottom: ${controlsOffset}px;
        }
      `}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        minZoom={minZoom}
        maxZoom={maxZoom}
      />
      {memoizedMarkers}
      <ZoomControl position="bottomright" />
      <LocateMapControl position="bottomright" />
    </Map>
  );
};

LooMap.propTypes = {
  loos: PropTypes.array,
  center: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  staticMap: PropTypes.bool,
  onViewportChanged: PropTypes.func,
  controlsOffset: PropTypes.number,
};

LooMap.defaultProps = {
  loos: [],
  zoom: config.initialZoom,
  minZoom: config.minZoom,
  maxZoom: config.maxZoom,
  staticMap: false,
  onViewportChanged: Function.prototype,
  controlsOffset: 0,
};

export default LooMap;

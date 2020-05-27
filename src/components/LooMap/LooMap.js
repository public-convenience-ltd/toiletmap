import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { css } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Map, TileLayer, ZoomControl } from 'react-leaflet';

import config from '../../config.js';
import LocateMapControl from './LocateMapControl';
import ToiletMarkerIcon from './ToiletMarkerIcon';

import Box from '../Box';
import Marker from './Marker';

import crosshair from '../../images/crosshair.svg';

const KEY_ENTER = 13;

const LooMap = ({
  center,
  zoom,
  minZoom,
  maxZoom,
  onViewportChanged,
  loos,
  staticMap,
  controlsOffset,
  showCrosshair,
}) => {
  const theme = useTheme();
  const mapRef = React.useRef();

  useEffect(() => {
    const map = mapRef.current.leafletElement.getContainer();

    // when focused on the map container, Leaflet allows the user to pan the map by using the arrow keys
    // without the application role screen reader software overrides these controls
    // this also avoid the entire main region being announced
    map.setAttribute('role', 'application');
    map.setAttribute('aria-label', 'use arrow keys to pan the map');
    map.setAttribute(
      'aria-keyshortcuts',
      'ArrowUp ArrowDown ArrowLeft ArrowRight'
    );
  }, []);

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
          label={toilet.name || 'Unnamed toilet'}
          onClick={() => {
            if (!staticMap) {
              push(`/loos/${toilet.id}`);
            }
          }}
          onKeyDown={(event) => {
            if (!staticMap && event.originalEvent.keyCode === KEY_ENTER) {
              push(`/loos/${toilet.id}`);
            }
          }}
          keyboard={!staticMap}
        />
      )),
    [loos, staticMap, push]
  );

  return (
    <Box
      position="relative"
      height="100%"
      width="100%"
      css={
        showCrosshair
          ? css`
              &:after {
                content: url(${crosshair});
                position: absolute;
                top: 50%;
                left: 50%;
                display: block;
                height: 53px;
                width: 52px;
                transform: translate(-50%, -50%);
              }
            `
          : undefined
      }
    >
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

          :focus,
          .leaflet-marker-icon:focus {
            outline: 2px solid ${theme.colors.tertiary} !important;
            outline-offset: 0.5rem;
          }

          :focus {
            outline-offset: 0;
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
    </Box>
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
  showCrosshair: PropTypes.bool,
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

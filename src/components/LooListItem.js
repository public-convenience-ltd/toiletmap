import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import L from 'leaflet';

import LooMap from './LooMap';

import styles from './css/loo-list-item.module.css';

const propTypes = {
  loo: PropTypes.object.isRequired,
  markerLabel: PropTypes.number,
  onHoverStart: PropTypes.func,
  onHoverEnd: PropTypes.func,
};

function round(value, precision = 0) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

const LooListItem = ({
  loo,
  mapCenter,
  markerLabel,
  onHoverStart = Function.prototype,
  onHoverEnd = Function.prototype,
}) => {
  const mapCenterLatLng = L.latLng(mapCenter.lat, mapCenter.lng);
  const looLatLng = L.latLng(loo.location.lat, loo.location.lng);
  const metersToLoo = mapCenterLatLng.distanceTo(looLatLng);

  const distanceToLoo =
    metersToLoo < 1000
      ? `${round(metersToLoo, 0)}m`
      : `${round(metersToLoo / 1000, 1)}km`;

  return (
    <Link
      data-testid={`loo:${loo.id}`}
      to={`/loos/${loo.id}`}
      className={styles.container}
      onMouseOver={onHoverStart}
      onMouseOut={onHoverEnd}
    >
      <LooMap
        markerLabel={() => markerLabel}
        loos={[loo]}
        center={loo.location}
        interactiveMarkers={false}
        showZoomControl={false}
        preventZoom
        preventDragging
      />

      <div className={styles.link}>
        <span className={styles.linkText}>More info</span>
      </div>

      <div className={styles.distance + ' distance--zindexfix'}>
        {distanceToLoo}
      </div>
    </Link>
  );
};

LooListItem.propTypes = propTypes;

export default LooListItem;

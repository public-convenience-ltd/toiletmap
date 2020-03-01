import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import LooMap from './LooMap';
import PreferenceIndicators from './PreferenceIndicators';

import styles from './css/loo-list-item.module.css';

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function humanizeDistance(meters) {
  if (meters < 1000) {
    return `${round(meters, 0)}m`;
  }
  return `${round(meters / 1000, 1)}km`;
}

function toRadians(deg) {
  return (Math.PI * deg) / 180;
}

/**
 * Implementation of the Haversine formula.
 */
function latLngToDistance(start, end) {
  let earthRadius = 6371 * 10 ** 3;
  let dLat = toRadians(end.lat - start.lat);
  let dLng = toRadians(end.lng - start.lng);
  let a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) ** 2;

  let distance = 2 * earthRadius * Math.asin(Math.sqrt(a));
  return distance;
}

class LooListItem extends Component {
  render() {
    var loo = this.props.loo;

    return (
      <Link
        data-testid={`loo:${loo.id}`}
        to={`/loos/${loo.id}`}
        className={styles.container}
        onMouseOver={this.props.onHoverStart}
        onMouseOut={this.props.onHoverEnd}
      >
        <LooMap
          countFrom={this.props.index}
          countLimit={1}
          showZoomControls={false}
          preventZoom={true}
          preventDragging={true}
          loos={[loo]}
          initialPosition={loo.location}
          activeMarkers={false}
        />

        <div className={styles.link}>
          <div className={styles.preferenceIndicators}>
            <PreferenceIndicators loo={loo} iconSize={1.4} />
          </div>

          <span className={styles.linkText}>More info</span>
        </div>

        <div className={styles.distance + ' distance--zindexfix'}>
          {humanizeDistance(latLngToDistance(this.props.center, loo.location))}
        </div>
      </Link>
    );
  }
}

LooListItem.propTypes = {
  loo: PropTypes.object.isRequired,
  index: PropTypes.number, // a number to show by the loo
  onHoverStart: PropTypes.func,
  onHoverEnd: PropTypes.func,
};

LooListItem.defaultProps = {
  onHoverStart: Function.prototype,
  onHoverEnd: Function.prototype,
};

export default LooListItem;

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { Link } from '@toiletmap/design-system';

import LooMap from '../LooMap';
import PreferenceIndicators from '../PreferenceIndicators';

import styles from './LooItem.module.css';

// Todo: Find better approach to global `distance--zindexfix` class name hack

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

/**
 * `<LooItem>`
 */
class LooItem extends Component {
  render() {
    var loo = this.props.loo;

    var coords = [
      this.props.loo.properties.geometry.coordinates[1],
      this.props.loo.properties.geometry.coordinates[0],
    ];

    const destination = `/loos/${loo._id}`;

    return (
      <div
        onClick={() => {
          // Programmatically navigate for non-a11y users
          this.props.history.push(destination);
        }}
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
          initialPosition={coords}
          activeMarkers={false}
        />

        <div className={styles.strip}>
          <div className={styles.preferenceIndicators}>
            <PreferenceIndicators loo={loo} iconSize={1.4} />
          </div>

          <Link
            data-testid={`loo:${loo._id}`}
            to={destination}
            light
            onClick={event => {
              // Prevent outer programmatic navigation being triggered
              event.stopPropagation();
            }}
          >
            More info
          </Link>
        </div>

        <div className={styles.distance + ' distance--zindexfix'}>
          {humanizeDistance(loo.distance)}
        </div>
      </div>
    );
  }
}

LooItem.propTypes = {
  /**
   * The loo data
   *
   * Todo: Define shape
   */
  loo: PropTypes.object.isRequired,
  /** Number to show on the map pin */
  index: PropTypes.number,
  /** Hover start callback */
  onHoverStart: PropTypes.func,
  /** Hover end callback */
  onHoverEnd: PropTypes.func,
  /** React-router history */
  history: PropTypes.object.isRequired,
};

LooItem.defaultProps = {
  onHoverStart: Function.prototype,
  onHoverEnd: Function.prototype,
};

export default withRouter(LooItem);

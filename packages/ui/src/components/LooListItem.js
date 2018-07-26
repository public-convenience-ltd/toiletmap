import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import LooMap from './LooMap';
import PreferenceIndicators from './PreferenceIndicators';

import styles from './css/loo-list-item.module.css';

class LooListItem extends Component {
  render() {
    var loo = this.props.loo;

    var coords = [
      this.props.loo.geometry.coordinates[1],
      this.props.loo.geometry.coordinates[0],
    ];

    return (
      <Link
        to={`/loos/${loo._id}`}
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

        <div className={styles.link}>
          <div className={styles.preferenceIndicators}>
            <PreferenceIndicators loo={loo} iconSize={1.4} />
          </div>

          <span className={styles.linkText}>More info</span>
        </div>

        <div className={styles.distance + ' distance--zindexfix'}>
          {Math.round(loo.distance)}m
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

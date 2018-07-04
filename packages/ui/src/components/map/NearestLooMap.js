import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import LooMap from './LooMap';

import {
  actionZoom,
  actionUpdateCenter,
} from '../../redux/modules/mapControls';
import { actionFindNearbyRequest } from '../../redux/modules/loos';

import styles from '../css/loo-map.module.css';

import config from '../../config';

class NearestLooMap extends Component {
  constructor(props) {
    super(props);
    this.onMove = this.onMove.bind(this);
  }

  onMove(lng, lat) {
    this.props.actionUpdateCenter({ lat, lng });
    this.props.actionFindNearbyRequest(lng, lat, config.nearestRadius);
  }

  render() {
    var loos = this.props.loos;

    // Return map to last stored position or default to user location
    var position = this.props.map.center || this.props.geolocation.position;

    return (
      <div className={styles.map}>
        {!loos && (
          <div className={styles.loading}>Fetching toilets&hellip;</div>
        )}

        <LooMap
          loos={loos}
          shouldCluster={true}
          showAttribution={true}
          showLocation={true}
          showSearchControl={true}
          showLocateControl={true}
          showFullscreenControl={true}
          showCenter={true}
          onZoom={this.props.actionZoom}
          onMove={this.onMove}
          initialZoom={this.props.map.zoom}
          initialPosition={position}
          highlight={this.props.map.highlight}
        />
      </div>
    );
  }
}

NearestLooMap.propTypes = {
  // An array of loo instances to be represented as map markers
  loos: PropTypes.array,
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  map: state.mapControls,
  loos: state.loos.nearby,
});

var mapDispatchToProps = {
  actionZoom,
  actionUpdateCenter,
  actionFindNearbyRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NearestLooMap);

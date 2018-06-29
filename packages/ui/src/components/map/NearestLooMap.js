import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import LooMap from './LooMap';

import config from '../../config';

import {
  actionZoom,
  actionUpdateCenter,
} from '../../redux/modules/mapControls';

import { actionFindNearbyRequest } from '../../redux/modules/loos';

import styles from '../css/loo-map.module.css';

class NearestLooMap extends Component {
  componentDidMount() {
    // Return map to last stored position or default to user location
    var position = this.props.map.center || this.props.geolocation.position;

    this.props.actionFindNearbyRequest(
      position.lng,
      position.lat,
      config.nearest.radius
    );

    this.onMove = this.onMove.bind(this);
  }

  onMove(lng, lat, radius) {
    this.props.actionUpdateCenter({ lat, lng });
    this.props.actionFindNearbyRequest(lng, lat, radius);
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import config from '../config';
import LooMap from './LooMap';

import { actionZoom, actionUpdateCenter } from '../redux/modules/mapControls';
import { actionFindNearbyRequest } from '../redux/modules/loos';

import styles from './css/loo-map.module.css';

class NearestLooMap extends Component {
  constructor(props) {
    super(props);
    this.onMove = this.onMove.bind(this);
  }

  componentDidMount() {
    if (this.props.loo) {
      let [lng, lat] = this.props.loo.geometry.coordinates;
      this.props.actionFindNearbyRequest(lng, lat, config.nearestRadius);

      if (this.looMap) {
        this.looMap.refs.map.leafletElement.fire('dataloading');
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.looMap && this.props.loos !== prevProps.loos) {
      this.looMap.refs.map.leafletElement.fire('dataload');
    }
  }

  onMove(lng, lat) {
    this.props.actionUpdateCenter({ lat, lng });
    this.props.actionFindNearbyRequest(lng, lat, config.nearestRadius);

    if (this.looMap) {
      this.looMap.refs.map.leafletElement.fire('dataloading');
    }
  }

  render() {
    var loos = this.props.loos;
    var loo = this.props.loo;
    var looCentre;
    if (loo) {
      looCentre = {
        lat: loo.geometry.coordinates[1],
        lng: loo.geometry.coordinates[0],
      };
    }

    // Return map to last stored position or default to user location
    var position =
      looCentre || this.props.map.center || this.props.geolocation.position;

    return (
      <div className={styles.map}>
        {!loos && (
          <div className={styles.loading}>Fetching toilets&hellip;</div>
        )}

        <LooMap
          wrappedComponentRef={it => (this.looMap = it)}
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
          {...this.props.mapProps}
        />
      </div>
    );
  }
}

NearestLooMap.propTypes = {
  // An array of loo instances to be represented as map markers
  loos: PropTypes.array,
  // A loo to focus
  loo: PropTypes.object,
  // props to spread (last) over the LooMap instance
  mapProps: PropTypes.object,
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import LooMap from './LooMap';

import { actionZoom, actionUpdateCenter } from '../redux/modules/mapControls';

import styles from './css/loo-map.module.css';

class NearestLooMap extends Component {
  constructor(props) {
    super(props);
    this.onUpdateCenter = this.onUpdateCenter.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.looMap && this.props.loos !== prevProps.loos) {
      this.looMap.refs.map.leafletElement.fire('dataload');
    }
  }

  onUpdateCenter({ lng, lat }) {
    this.props.actionUpdateCenter({ lat, lng });

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
          countLimit={this.props.numberNearest ? 5 : 0}
          showAttribution={true}
          showLocation={true}
          showSearchControl={true}
          showLocateControl={true}
          showCenter={true}
          onZoom={this.props.actionZoom}
          onUpdateCenter={this.onUpdateCenter}
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
  // Whether to show an index on the nearest five loos
  numberNearest: PropTypes.bool,
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  map: state.mapControls,
  loos: state.loos.nearby,
});

var mapDispatchToProps = {
  actionZoom,
  actionUpdateCenter,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NearestLooMap);

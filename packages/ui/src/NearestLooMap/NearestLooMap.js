import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import LooMap from '../LooMap';

import { actionZoom, actionUpdateCenter } from '../redux/modules/mapControls';

import styles from './NearestLooMap.module.css';

class NearestLooMap extends Component {
  constructor(props) {
    super(props);

    this.onUpdateCenter = this.onUpdateCenter.bind(this);
  }

  componentDidMount() {
    // Only do if leaflet map element is ready and we're loading
    if (this.looMap && this.props.loadingNearby) {
      this.looMap.refs.map.leafletElement.fire('dataloading');
    }
  }

  componentDidUpdate(prevProps) {
    // Only do if leaflet map element is ready and we've started loading or loaded
    if (this.looMap && this.props.loadingNearby !== prevProps.loadingNearby) {
      if (this.props.loadingNearby) {
        this.looMap.refs.map.leafletElement.fire('dataloading');
      } else {
        this.looMap.refs.map.leafletElement.fire('dataload');
      }
    }
  }

  onUpdateCenter({ lng, lat }) {
    this.props.actionUpdateCenter({ lat, lng });
  }

  render() {
    var loos = this.props.loos;
    var loo = this.props.loo;
    var looCentre;
    if (loo) {
      looCentre = {
        lat: loo.properties.geometry.coordinates[1],
        lng: loo.properties.geometry.coordinates[0],
      };
    }

    // Return map to last stored position or default to user location
    var position =
      looCentre || this.props.map.center || this.props.geolocation.position;

    return (
      <LooMap
        wrappedComponentRef={it => (this.looMap = it)}
        loos={loos}
        countLimit={this.props.numberNearest ? 5 : 0}
        showcontributor={true}
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
      >
        {!loos && (
          <div className={styles.loading}>Fetching toilets&hellip;</div>
        )}
      </LooMap>
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
  loadingNearby: state.loos.loadingNearby,
});

var mapDispatchToProps = {
  actionZoom,
  actionUpdateCenter,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NearestLooMap);

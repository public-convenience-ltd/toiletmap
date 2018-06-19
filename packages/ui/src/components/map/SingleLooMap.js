import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import LooMap from './LooMap';

import config from '../../config';

class SingleLooMap extends Component {
  render() {
    var loo = this.props.loo;

    // Set map center on loo position
    var coords = {
      lat: loo.geometry.coordinates[1],
      lng: loo.geometry.coordinates[0],
    };

    var mapProps = Object.assign(
      {
        showAttribution: true,
        showLocation: false,
        showSearchControl: false,
        showLocateControl: false,
        showFullscreenControl: true,
        showCenter: false,
        preventDragging: true,
        minZoom: config.initialZoom,
      },
      this.props.looMapProps
    );

    return <LooMap {...mapProps} loos={[loo]} initialPosition={coords} />;
  }
}

SingleLooMap.propTypes = {
  // A loo instances to be represented as map marker
  loo: PropTypes.object.isRequired,

  // Allows certain default prop values for the `LooMap` Component to be overriden
  looMapProps: PropTypes.object,
};

SingleLooMap.defaultProps = {
  looMapProps: {},
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
});

var mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleLooMap);

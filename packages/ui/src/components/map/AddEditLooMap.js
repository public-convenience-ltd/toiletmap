import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LooMap from './LooMap';

import { actionUpdateCenter } from '../../redux/modules/loo-map-add-edit';

import styles from '../css/edit-loo-map.module.css';

class AddEditLooMap extends Component {
  componentDidMount() {
    var loo = this.props.loo;

    // Reset the map center
    if (loo) {
      this.props.actionUpdateCenter({
        lat: loo.geometry.coordinates[1],
        lng: loo.geometry.coordinates[0],
      });
    }
  }

  render() {
    var loo = this.props.loo;

    // Default map center to user's geolocation
    var center = this.props.geolocation.position;

    // Center on the loo's coordinates, if we have one
    if (loo) {
      center = {
        lat: loo.geometry.coordinates[1],
        lng: loo.geometry.coordinates[0],
      };
    }

    // Allows the user to update the map center in order to update
    // the loo position
    if (this.props.map.center) {
      center = this.props.map.center;
    }

    var mapProps = Object.assign(
      {
        showAttribution: true,
        showLocation: true,
        showSearchControl: true,
        showLocateControl: true,
        showFullscreenControl: true,
        className: styles.map,
      },
      this.props.looMapProps
    );

    return (
      <LooMap
        {...mapProps}
        loos={loo ? [loo] : []}
        onUpdateCenter={this.props.actionUpdateCenter}
        initialPosition={center}
        showCrosshair={true}
      />
    );
  }
}

AddEditLooMap.propTypes = {
  // Allows certain default prop values for the `LooMap` Component to be overriden
  looMapProps: PropTypes.object,
};

AddEditLooMap.defaultProps = {
  looMapProps: {},
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  map: state.mapAddEdit,
  loo: state.loos.byId,
});

var mapDispatchToProps = {
  actionUpdateCenter,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditLooMap);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { actionGetGeolocationRequest } from '../redux/modules/geolocation';

import styles from './App.module.css';

class App extends Component {
  componentDidMount() {
    if (!this.props.geolocation.location || !this.props.geolocation.error) {
      // Cordova environment expects us to wait for `deviceready`. If the geolocation
      // request is fired too early we get an ugly message.
      // http://stackoverflow.com/questions/28891339/fix-cordova-geolocation-ask-for-location-message
      if (window.cordova) {
        document.addEventListener(
          'deviceready',
          this.props.actionGetGeolocationRequest,
          false
        );
      } else {
        this.props.actionGetGeolocationRequest();
      }
    }
  }

  render() {
    if (!this.props.map.center) {
      return (
        <div className={styles.wrapper}>
          <p>Fetching toilets&hellip;</p>
        </div>
      );
    }

    return this.props.children;
  }
}

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  map: state.mapControls,
});

var mapDispatchToProps = {
  actionGetGeolocationRequest,
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(App)
);

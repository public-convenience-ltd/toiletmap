import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { actionGetGeolocationRequest } from '../redux/modules/geolocation';

import styles from './css/app.module.css';

class App extends Component {
  componentDidMount() {
    if (!this.props.geolocation.location) {
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
    // Geolocation error
    if (this.props.geolocation.error) {
      return (
        <div className={styles.wrapper}>
          <p>{this.props.geolocation.error}</p>
        </div>
      );
    }

    // Fetching toilet data
    if (!this.props.geolocation.position) {
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

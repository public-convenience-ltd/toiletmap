import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actionGetGeolocationRequest } from '../redux/modules/geolocation';
import { actionProcessPendingReports } from '../redux/modules/loos';
import { actionNavigate } from '../redux/modules/app';
import { actionGetStatusRequest } from '../redux/modules/auth';

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

    // Process any pending loo reports
    this.props.actionProcessPendingReports();

    // Determine the logged in state
    this.props.actionGetStatusRequest();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.location !== this.props.location) {
      this.props.actionNavigate();
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
  actionNavigate,
  actionProcessPendingReports,
  actionGetStatusRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

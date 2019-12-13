import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { actionGetGeolocationRequest } from '../redux/modules/geolocation';

import styles from './css/app.module.css';

class App extends Component {
  componentDidMount() {
    if (!this.props.geolocation.location || !this.props.geolocation.error) {
      this.props.actionGetGeolocationRequest();
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

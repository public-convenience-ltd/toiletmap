import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';

import { actionLoggedIn, actionSetName } from '../redux/modules/auth';

import { Notification } from '@toiletmap/design-system';

import config from '../config';

class Callback extends Component {
  async componentDidMount() {
    const { auth } = this.props;

    if (/access_token|id_token|error/.test(window.location.hash)) {
      await auth.handleAuthentication();
      await auth.fetchProfile();
    }

    if (auth.isAuthenticated()) {
      // dispatch a login action
      this.props.loggedIn(true);
      this.props.setName(auth.getProfile().name);
      window.location = auth.redirectOnLogin() || '/';
    } else {
      window.location = 'login';
    }
  }

  render() {
    return (
      <MediaQuery minWidth={config.viewport.mobile}>
        <Notification>
          <p>Updating credentials</p>
        </Notification>
      </MediaQuery>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  loggedIn: actionLoggedIn,
  setName: actionSetName,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Callback);

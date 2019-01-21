import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actionLoggedIn, actionSetName } from '../redux/modules/auth';

import PageLayout from '../components/PageLayout';
import Notification from '../components/Notification';
import MediaQuery from 'react-responsive';
import config from '../config';

class Callback extends Component {
  async componentDidMount() {
    if (/access_token|id_token|error/.test(this.props.location.hash)) {
      await this.props.auth.handleAuthentication();
      await this.props.auth.fetchProfile();
    }

    if (this.props.auth.isAuthenticated()) {
      // dispatch a login action
      this.props.loggedIn(true);
      this.props.setName(this.props.auth.getProfile().name);
      this.props.history.push(this.props.auth.redirectOnLogin() || '/');
    } else {
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <PageLayout
        main={
          <MediaQuery minWidth={config.viewport.mobile}>
            <Notification>
              <p>Updating credentials</p>
            </Notification>
          </MediaQuery>
        }
        map={
          <MediaQuery minWidth={config.viewport.mobile}>
            <Notification>
              <p>Updating credentials</p>
            </Notification>
          </MediaQuery>
        }
      />
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

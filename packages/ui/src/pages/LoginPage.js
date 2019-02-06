import React, { Component } from 'react';
import { connect } from 'react-redux';

import config from '../config';

import { actionLogin } from '../redux/modules/auth';

import { Button, Heading, VerticalSpacing } from '@toiletmap/design-system';

class LoginPage extends Component {
  renderMain() {
    return (
      <div>
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={window.history.back}>Back</Button>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Heading headingLevel={2} size="large">
          Hello! What's your name?
        </Heading>

        <p>Before you can contribute data we'll need to know who to thank.</p>
        <p>
          We'll only store the first part of the email address you give us
          against the data you contribute.
        </p>
        <p>Login or sign up to let us know you're real.</p>

        <VerticalSpacing />

        <Button onClick={this.props.doLogin}>Log In/Sign Up</Button>
      </div>
    );
  }

  render() {
    return this.renderMain();
  }
}

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {
  doLogin: actionLogin,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);

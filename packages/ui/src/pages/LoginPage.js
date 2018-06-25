import React, { Component } from 'react';
import history from '../history';
import { connect } from 'react-redux';

import { actions, LOGIN } from '../redux/modules/auth';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

class LoginPage extends Component {
  render() {
    return (
      <div>
        <div>
          <div className={layout.controls}>
            <button onClick={history.goBack} className={controls.btn}>
              Back
            </button>
          </div>
        </div>

        <h2 className={headings.large}>Hello! What's your name?</h2>

        <p>Before you can contribute data we'll need to know who to thank.</p>
        <p>
          We'll only store the name you give us against the data you contribute.
        </p>
        <p>Login aor sign up to let us know you're real.</p>

        <div className={controls.btnStack}>
          <button onClick={this.props.doLogin}>Log In/Sign Up</button>
        </div>
      </div>
    );
  }
}

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {
  doLogin: actions[LOGIN],
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginPage);

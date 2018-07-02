import React, { Component } from 'react';
import history from '../history';
import { connect } from 'react-redux';

import { actionLogin } from '../redux/modules/auth';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/map/NearestLooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

class LoginPage extends Component {
  renderMain() {
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

  renderMap() {
    return <NearestLooMap />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
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

import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import _ from 'lodash';

import { actionAuthRequest } from '../../redux/modules/auth';

import layout from '../css/layout.module.css';
import headings from '../../css/headings.module.css';
import controls from '../../css/controls.module.css';

class SingInPage extends Component {
  render() {
    return (
      <div>
        {this.props.app.canGoBack && (
          <div>
            <div className={layout.controls}>
              <button onClick={browserHistory.goBack} className={controls.btn}>
                Back
              </button>
            </div>
          </div>
        )}

        <h2 className={headings.large}>Hello! What's your name?</h2>

        <p>Before you can contribute data we'll need to know who to thank.</p>
        <p>
          We'll only store the name you give us against the data you contribute.
        </p>
        <p>Use one of the services below to let us know you're real.</p>

        <div className={controls.btnStack}>
          <button
            className={controls.facebook}
            onClick={_.partial(this.props.actionAuthRequest, 'facebook')}
          >
            Facebook
          </button>
          <button
            className={controls.twitter}
            onClick={_.partial(this.props.actionAuthRequest, 'twitter')}
          >
            Twitter
          </button>
          <button
            className={controls.osm}
            onClick={_.partial(this.props.actionAuthRequest, 'openstreetmap')}
          >
            OpenStreetMap
          </button>
          <button
            className={controls.github}
            onClick={_.partial(this.props.actionAuthRequest, 'github')}
          >
            Github
          </button>
        </div>
      </div>
    );
  }
}

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {
  actionAuthRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingInPage);

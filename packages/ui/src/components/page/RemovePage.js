import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { browserHistory } from 'react-router';
import { connect } from 'react-redux';

import layout from '../css/layout.module.css';
import headings from '../../css/headings.module.css';
import controls from '../../css/controls.module.css';

import config from '../../config';

class RemovePage extends Component {
  render() {
    var endpoint = `${config.apiEndpoint}/remove/${this.props.loo._id}`;

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

        <h2 className={headings.large}>Toilet Remover</h2>

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
        </p>

        <form action={endpoint} method="post">
          <label>
            Reason for removal
            <textarea type="text" name="reason" className={controls.text} />
          </label>

          <button type="submit" className={controls.btnCaution}>
            Remove it
          </button>
        </form>
      </div>
    );
  }
}

RemovePage.propTypes = {
  loo: PropTypes.object.isRequired,
};

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemovePage);

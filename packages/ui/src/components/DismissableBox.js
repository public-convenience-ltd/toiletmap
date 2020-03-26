import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './css/dismissable-box.module.css';

import config from '../config.js';

class DismissableBox extends Component {
  constructor(props) {
    super(props);

    // Set the initial state
    this.state = {
      dimissed: false,
    };

    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss() {
    var persistKey = this.props.persistKey;

    this.setState({
      dismissed: true,
    });

    if (persistKey) {
      config.setSetting('dismissed', persistKey, true);
    }

    this.props.onDismiss();
  }

  render() {
    var persistKey = this.props.persistKey;

    if (
      this.state.dismissed ||
      (persistKey && config.getSetting('dismissed', persistKey))
    ) {
      return null;
    }

    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{this.props.title}</h2>
        <div>{this.props.content}</div>
        <button className={styles.close} onClick={this.onDismiss}>
          ✖
        </button>
      </div>
    );
  }
}

DismissableBox.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,

  // If specified, the dismissed state will be persisted with this identifier
  // in a browser cookie
  persistKey: PropTypes.string,

  // Callback fn triggered once a message has been dismissed
  onDismiss: PropTypes.func,
};

DismissableBox.defaultProps = {
  onDismiss: Function.prototype,
};

export default DismissableBox;

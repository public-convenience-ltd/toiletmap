import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './DismissibleBox.module.css';

import Heading from '../Heading';

const STORAGE_NAMESPACE = 'dismissed';

/**
 * `<DismissibleBox>`
 */
class DismissibleBox extends Component {
  constructor(props) {
    super(props);

    // Set the initial state
    this.state = {
      dimissed: false,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.getPersistenceSetting = this.getPersistenceSetting.bind(this);
    this.setPersistenceSetting = this.setPersistenceSetting.bind(this);
  }

  onDismiss() {
    const { persistKey } = this.props;

    this.setState({
      dismissed: true,
    });

    if (persistKey) {
      this.setPersistenceSetting(persistKey);
    }

    this.props.onDismiss();
  }

  getPersistenceSetting() {
    return JSON.parse(localStorage.getItem(STORAGE_NAMESPACE) || '{}');
  }

  setPersistenceSetting() {
    var settings = this.getPersistenceSetting();
    settings[this.props.persistKey] = true;
    localStorage.setItem(STORAGE_NAMESPACE, JSON.stringify(settings));
  }

  render() {
    const { persistKey } = this.props;

    if (this.state.dismissed || (persistKey && this.getPersistenceSetting())) {
      return null;
    }

    return (
      <div className={styles.container}>
        <Heading headingLevel={2} size="large">
          {this.props.title}
        </Heading>
        <div dangerouslySetInnerHTML={{ __html: this.props.content }} />
        <button
          className={styles.close}
          onClick={this.onDismiss}
          aria-label="Dismiss"
        >
          ✖
        </button>
      </div>
    );
  }
}

DismissibleBox.propTypes = {
  /** Title */
  title: PropTypes.string.isRequired,
  /** Content */
  content: PropTypes.string.isRequired,
  /**
   * Name of a key to persist the dismissed status at
   *
   * If specified, the dismissed state will be persisted with this identifier
   * in a browser cookie
   */
  persistKey: PropTypes.string,
  /** Callback fn triggered once a message has been dismissed */
  onDismiss: PropTypes.func,
};

DismissibleBox.defaultProps = {
  onDismiss: Function.prototype,
};

export default DismissibleBox;

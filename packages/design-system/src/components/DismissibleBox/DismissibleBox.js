import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './DismissibleBox.module.css';

// Todo: Should not be handled within the design-system
//import config from '../../../../config';

import Heading from '../Heading';

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
  }

  onDismiss() {
    var persistKey = this.props.persistKey;

    this.setState({
      dismissed: true,
    });

    if (persistKey) {
      throw new Error('TODO: Fix Me!');
      //config.setSetting('dismissed', persistKey, true);
    }

    this.props.onDismiss();
  }

  render() {
    var persistKey = this.props.persistKey;

    if (
      this.state.dismissed
      // this.state.dismissed ||
      // (persistKey && config.getSetting('dismissed', persistKey))
    ) {
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

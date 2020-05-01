import React from 'react';
import PropTypes from 'prop-types';

import styles from './css/dismissable-box.module.css';

import config from '../config.js';

const propTypes = {
  title: PropTypes.string,
  content: PropTypes.node,

  // If specified, the dismissed state will be persisted with this identifier
  // in a browser cookie
  persistKey: PropTypes.string,

  // Callback fn triggered once a message has been dismissed
  handleDismiss: PropTypes.func,
};

const DismissableBox = ({
  title,
  content,
  persistKey,
  onDismiss = Function.prototype,
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);

    if (persistKey) {
      config.setSetting('dismissed', persistKey, true);
    }

    onDismiss();
  };

  if (
    isDismissed ||
    (persistKey && config.getSetting('dismissed', persistKey))
  ) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div>{content}</div>
      <button className={styles.close} onClick={handleDismiss}>
        ✖
      </button>
    </div>
  );
};

DismissableBox.propTypes = propTypes;

export default DismissableBox;

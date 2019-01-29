import React from 'react';

import styles from './Notification.module.css';

/**
 * `<Notification>`
 */
const Notification = props => (
  <div className={styles.notification} role="alert" aria-live="assertive">
    {props.children}
  </div>
);

export default Notification;

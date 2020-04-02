import React from 'react';

import styles from './css/notification.module.css';

const Notification = ({ children }) => {
  return (
    <div className={styles.notification} role="alert" aria-live="assertive">
      {children}
    </div>
  );
};

export default Notification;

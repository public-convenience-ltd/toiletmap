import React from 'react';

import Notification from './Notification';
import styles from './css/loo-map.module.css';

export default props => {
  if (props.fullScreen) {
    return <div className={styles.loading}>{props.message}</div>;
  }
  return (
    <Notification>
      <p>{props.message}</p>
    </Notification>
  );
};

import React from 'react';

import Notification from '../design-system/src/components/Notification';

import styles from './Loading.module.css';

const Loading = props => {
  if (props.fullScreen) {
    return (
      <div className={styles.loading + ' loading--zindexfix'}>
        {props.message}
      </div>
    );
  }

  return (
    <Notification>
      <p>{props.message}</p>
    </Notification>
  );
};

export default Loading;

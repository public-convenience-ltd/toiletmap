import React, { Component } from 'react';

import styles from './css/notification.module.css';

class Notification extends Component {
  render() {
    return (
      <div className={styles.notification} role="alert" aria-live="assertive">
        {this.props.children}
      </div>
    );
  }
}

export default Notification;

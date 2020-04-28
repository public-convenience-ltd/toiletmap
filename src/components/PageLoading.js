import React from 'react';

import styles from './css/app.module.css';

import logo from '../images/logo.svg';

const PageLoading = (props) => (
  <div className={styles.pageLoading}>
    <img src={logo} alt="'The Great British Toilet Map' logo" />
    <div>Please wait&hellip;</div>
  </div>
);

export default PageLoading;

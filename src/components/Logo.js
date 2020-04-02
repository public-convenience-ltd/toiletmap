import React from 'react';
import { Link } from 'react-router-dom';

import styles from './css/logo.module.css';
import logo from '../images/logo.svg';

export default () => (
  <Link to="/" title="Go to home page" className={styles.wrapper}>
    <img
      src={logo}
      alt="'The Great British Toilet Map' logo"
      className={styles.image}
    />
    <span className={styles.title}>
      The Great British <span>Public Toilet Map</span>
    </span>
  </Link>
);

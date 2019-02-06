import React, { Component } from 'react';

import { Link } from '@toiletmap/design-system';

import styles from './Footer.module.css';

class Footer extends Component {
  render() {
    return (
      <footer className={styles.footer}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link to="/preferences" displayType="block" light>
              Preferences
            </Link>
          </li>
          <li className={styles.item}>
            <Link to="/privacy" displayType="block" light>
              Privacy
            </Link>
          </li>
          <li className={styles.item}>
            <Link to="/about" displayType="block" light>
              About
            </Link>
          </li>
        </ul>
      </footer>
    );
  }
}

export default Footer;

import React, { Component } from 'react';
import { Link } from 'react-router';

import styles from './css/footer.module.css';

class Footer extends Component {
  render() {
    return (
      <footer className={styles.footer}>
        <ul className={styles.footerList}>
          <li className={styles.footerListItem}>
            <Link to="/preferences" className={styles.footerItem}>
              <span className={styles.footerItemText}>
                My toilet preferences
              </span>
            </Link>
          </li>
          <li className={styles.footerListItem}>
            <Link to="/about" className={styles.footerItem}>
              <span className={styles.footerItemText}>About this project</span>
            </Link>
          </li>
        </ul>
      </footer>
    );
  }
}

export default Footer;

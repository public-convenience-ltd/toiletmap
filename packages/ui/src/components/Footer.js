import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styles from './css/footer.module.css';

import CookiePopupButton from './Tracking/CookiePopupButton';

class Footer extends Component {
  render() {
    return (
      <footer className={styles.footer}>
        <ul className={styles.footerList}>
          <li className={styles.footerListItem}>
            <Link to="/preferences" className={styles.footerItem}>
              <span className={styles.footerItemText}>Preferences</span>
            </Link>
          </li>
          <li className={styles.footerListItem}>
            <Link to="/privacy" className={styles.footerItem}>
              <span className={styles.footerItemText}>Privacy Policy</span>
            </Link>
          </li>
          <li className={styles.footerListItem}>
            <Link to="/about" className={styles.footerItem}>
              <span className={styles.footerItemText}>About</span>
            </Link>
          </li>
          <li className={styles.footerListItem}>
            <CookiePopupButton onClick={this.props.onCookieButtonClick} />
          </li>
        </ul>
      </footer>
    );
  }
}

export default Footer;

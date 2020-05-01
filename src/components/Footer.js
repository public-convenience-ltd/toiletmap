import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import styles from './css/footer.module.css';

import CookieBoxButton from './Tracking/CookieBoxButton';

const chooseLinkStyle = (location, path) => {
  if (location.pathname === path) {
    return styles.footerItemActive;
  }

  return styles.footerItem;
};

const Footer = (props) => (
  <footer className={styles.footer}>
    <ul className={styles.footerList}>
      <li className={styles.footerListItem}>
        <Link
          to="/privacy"
          className={chooseLinkStyle(props.location, '/privacy')}
        >
          <span className={styles.footerItemText}>Privacy Policy</span>
        </Link>
      </li>
      <li className={styles.footerListItem}>
        <Link to="/about" className={chooseLinkStyle(props.location, '/about')}>
          <span className={styles.footerItemText}>About</span>
        </Link>
      </li>
      <li className={styles.footerListItem}>
        <CookieBoxButton
          onClick={props.onCookieBoxButtonClick}
          isCookieSettingsOpen={props.isCookieSettingsOpen}
        />
      </li>
    </ul>
  </footer>
);

Footer.displayName = 'Footer';
Footer.propTypes = {
  onCookieBoxButtonClick: PropTypes.func.isRequired,
  isCookieSettingsOpen: PropTypes.bool,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
};

export default withRouter(Footer);

import React from 'react';

import styles from '../css/cookie-box.module.css';
import controlStyles from '../../css/controls.module.css';

const CookieBoxButton = ({ onClick }) => (
  <div className={styles.cookieButtonWrapper}>
    <button
      className={controlStyles.btn}
      type="button"
      onClick={onClick}
      title="Open the cookie settings"
    >
      <span role="img" aria-label="Cookie Emoji">
        🍪
      </span>
    </button>
  </div>
);

export default CookieBoxButton;

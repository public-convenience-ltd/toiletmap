import React from 'react';

import styles from '../css/cookie-box-button.module.css';

const CookieBoxButton = ({ onClick, isCookieSettingsOpen }) => (
  <div className={styles.cookieButtonWrapper}>
    <button
      className={styles.btn}
      type="button"
      onClick={onClick}
      aria-controls="tracking-preferences"
      aria-expanded={isCookieSettingsOpen}
      title={`${isCookieSettingsOpen ? 'Close' : 'Open'} the cookie settings`}
    >
      <span role="img" aria-label="Cookie Emoji">
        🍪
      </span>
    </button>
  </div>
);

export default CookieBoxButton;

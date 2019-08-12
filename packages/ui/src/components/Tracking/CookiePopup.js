import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import styles from '../css/cookie-popup.module.css';
import controlStyles from '../../css/controls.module.css';

const CookiePopupButton = ({ onClick }) => (
  <div className={styles.cookieButton}>
    <button
      type="button"
      onClick={onClick}
      className={controlStyles.btn}
      title="Re-open the cookie banner"
    >
      <span role="img" aria-label="Cookie Emoji">
        🍪
      </span>
    </button>
  </div>
);

const noop = () => {};

const CookiePopup = ({
  options = [],
  onChange = noop,
  value,
  open,
  onOpen = noop,
}) => (
  <div className={open ? styles.wrapperOpen : styles.wrapper}>
    {!open && <CookiePopupButton onClick={onOpen} />}
    {open && (
      <>
        <p>TODO: Some words</p>

        <div>
          <div className={controlStyles.btnStack}>
            {options.map(([option, text]) => (
              <button
                key={option}
                className={controlStyles.btn}
                type="button"
                onClick={() => onChange(option)}
              >
                {text}
                {value === option && '✓'}
              </button>
            ))}
          </div>
        </div>
      </>
    )}
  </div>
);

CookiePopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default props =>
  ReactDOM.createPortal(
    <CookiePopup {...props} />,
    document.getElementById('cookie-popup-root')
  );

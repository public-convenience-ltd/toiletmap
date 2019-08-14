import React from 'react';
import PropTypes from 'prop-types';

import styles from '../css/cookie-popup.module.css';
import controlStyles from '../../css/controls.module.css';

const noop = () => {};
const CookiePopup = ({ options = [], onChange = noop, value, open }) => (
  <div className={open ? styles.wrapperOpen : styles.wrapper}>
    {open && (
      <div className={styles.popupBody}>
        <p>Tracking words</p>
        <p>Tracking words</p>
        <p>Tracking words</p>
        <p>Tracking words</p>
        <hr />
        <p>Tracking words</p>
        <p>Tracking words</p>
        <p>Tracking words</p>

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
                {value === option && ' ✓'}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

CookiePopup.propTypes = {
  options: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default props => <CookiePopup {...props} />;

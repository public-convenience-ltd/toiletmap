import React from 'react';
import PropTypes from 'prop-types';

import styles from '../css/cookie-box.module.css';

const noop = () => {};
const CookieBox = ({ options = [], onChange = noop, value, open }) => (
  <div className={open ? styles.wrapperOpen : styles.wrapper}>
    {open && (
      <div className={styles.popupBody}>
        <p>Tracking words</p>
        <p>Tracking words</p>

        <hr />
        <p>Tracking words</p>
        <p>Tracking words</p>
        <p>Tracking words</p>

        <div />
      </div>
    )}
  </div>
);

CookieBox.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default props => <CookieBox {...props} />;

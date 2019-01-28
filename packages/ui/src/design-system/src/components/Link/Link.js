import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Link as RouterLink } from 'react-router-dom';

import styles from './Link.module.css';

const cx = classNames.bind(styles);

const DISPLAY_TYPE_NORMAL = 'normal';
const DISPLAY_TYPE_BLOCK = 'block';

/**
 * `<Link>`
 */
const Link = ({ light, displayType, children, ...props }) => (
  <RouterLink
    className={cx('base', {
      light,
      block: displayType === DISPLAY_TYPE_BLOCK,
    })}
    {...props}
  >
    <span className={styles.text} children={children} />
  </RouterLink>
);

Link.propTypes = {
  /** The location to send the user when the link is invoked */
  to: PropTypes.string.isRequired,
  /** Show the link against a dark background */
  light: PropTypes.bool,
  /** Display type */
  displayType: PropTypes.oneOf([DISPLAY_TYPE_NORMAL, DISPLAY_TYPE_BLOCK]),
};

Link.defaultProps = {
  light: false,
  displayType: DISPLAY_TYPE_NORMAL,
};

export default Link;

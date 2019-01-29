import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Group.module.css';

const cx = classNames.bind(styles);

const DIRECTION_ROW = 'row';
const DIRECTION_COLUMN = 'column';

/**
 * `<Group>`
 */
const Group = props => (
  <div className={cx('group', props.direction)} {...props} />
);

Group.propTypes = {
  /** The button direction */
  direction: PropTypes.oneOf([DIRECTION_COLUMN, DIRECTION_ROW]),
};

Group.defaultProps = {
  direction: DIRECTION_COLUMN,
};

export default Group;

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';

import styles from './Button.module.css';

const cx = classNames.bind(styles);

const TYPE_NORMAL = 'normal';
const TYPE_FEATURED = 'featured';
const TYPE_CAUTION = 'caution';

const SIZE_SMALL = 'small';
const SIZE_REGULAR = 'regular';

/**
 * The `<Button>` is a foundational trigger component for capturing
 * and guiding user-interaction.
 */
const Button = ({ withComponent, htmlType, type, size, ...props }) =>
  React.createElement(withComponent, {
    className: cx('base', type, size),
    type: htmlType,
    ...props,
  });

Button.propTypes = {
  /** The component to render */
  withComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  /** The html `type` attribute value */
  htmlType: PropTypes.oneOf(['submit', 'button', 'reset']),
  /** Visual type */
  type: PropTypes.oneOf([TYPE_NORMAL, TYPE_FEATURED, TYPE_CAUTION]),
  /** Size. Deprecate? - almost makes no difference */
  size: PropTypes.oneOf([SIZE_SMALL, SIZE_REGULAR]),
};

Button.defaultProps = {
  withComponent: 'button',
  htmlType: 'button',
  type: TYPE_NORMAL,
  size: SIZE_REGULAR,
};

export default Button;

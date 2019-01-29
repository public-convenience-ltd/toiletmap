import React from 'react';
import PropTypes from 'prop-types';

import styles from './Heading.module.css';

const SIZE_SMALL = 'small';
const SIZE_REGULAR = 'regular';
const SIZE_LARGE = 'large';

/**
 * `<Heading>`
 */
const Heading = ({ headingLevel, size, ...props }) =>
  React.createElement(`h${headingLevel}`, {
    className: styles[size],
    ...props,
  });

Heading.propTypes = {
  /** HTML heading level */
  headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  /** Visual size */
  size: PropTypes.oneOf([SIZE_SMALL, SIZE_REGULAR, SIZE_LARGE]),
};

Heading.defaultProps = {
  size: SIZE_REGULAR,
};

export default Heading;

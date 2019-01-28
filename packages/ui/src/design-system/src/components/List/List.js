import React from 'react';
import PropTypes from 'prop-types';

import styles from './List.module.css';

/**
 * `<List>`
 */
const List = ({ ordered, ...props }) => {
  const element = ordered ? 'ol' : 'ul';

  return React.createElement(element, {
    className: styles.list,
    ...props,
  });
};

List.propTypes = {
  /** Denotes that there is an order to the list */
  ordered: PropTypes.bool,
};

List.defaultProps = {
  ordered: false,
};

export default List;

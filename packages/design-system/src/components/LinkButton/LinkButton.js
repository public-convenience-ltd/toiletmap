import React from 'react';
import PropTypes from 'prop-types';
import { Link } from '@reach/router';

import Button from '../Button';

/**
 * `<LinkButton>`
 */
const LinkButton = ({ to, ...props }) => {
  // External link
  if (to.match('//')) {
    return (
      <Button
        href={to}
        withComponent="a"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  }

  // Internal link
  return <Button withComponent={Link} to={to} {...props} />;
};

LinkButton.propTypes = {
  ...Button.propTypes,
  /** The location to send the user when the link is invoked */
  to: PropTypes.string.isRequired,
};

export default LinkButton;

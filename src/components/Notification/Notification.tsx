import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Box from '../Box';
import Text from '../Text';
import Icon from '../../design-system/components/Icon';
import Spacer from '../Spacer';

const Notification = ({ allowClose = true, children }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      role="alert"
      aria-live="assertive"
      display="flex"
      justifyContent="space-between"
      py={2}
      px={3}
      color="primary"
      bg="secondary"
    >
      <Text textAlign="center" fontWeight="bold">
        {children}
      </Text>

      {allowClose && (
        <>
          <Spacer ml={2} />

          <button
            type="button"
            aria-label="Close notification"
            css={{ display: 'flex', alignItems: 'center' }}
            onClick={() => setIsVisible(false)}
          >
            <Icon icon="xmark" size="medium" />
          </button>
        </>
      )}
    </Box>
  );
};

Notification.propTypes = {
  /** Allow the notification to be closed */
  allowClose: PropTypes.bool,
  /** The notification message */
  children: PropTypes.node,
};

/** @component */
export default Notification;

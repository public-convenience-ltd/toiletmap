import React from 'react';

import Box from './Box';
import Text from './Text';

const Notification = ({ children }) => (
  <Box display="flex" justifyContent="center" height="100%" px={3} py={5}>
    <Box role="alert" aria-live="assertive" color="tertiary">
      <Text textAlign="center" fontWeight="bold">
        {children}
      </Text>
    </Box>
  </Box>
);

export default Notification;

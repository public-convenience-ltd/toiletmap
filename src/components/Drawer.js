import React from 'react';
import PropTypes from 'prop-types';

import Box from './Box';

const MENU_HEIGHT = 60; // px

const Drawer = ({ visible, ...props }) => (
  <Box
    position="fixed"
    top={MENU_HEIGHT}
    left={0}
    height={`calc(100vh - ${MENU_HEIGHT}px)`}
    width="100%"
    bg="white"
    p={3}
    zIndex={10}
    overflowY="auto"
    hidden={!visible}
    {...props}
  />
);

Drawer.propTypes = {
  visible: PropTypes.bool,
};

export default Drawer;

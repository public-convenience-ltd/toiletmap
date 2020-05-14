import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Box from './Box';

const MENU_HEIGHT = 60; // px

const variants = {
  open: {
    display: 'block',
    left: '0%',
  },
  closed: {
    left: '100%',
    transitionEnd: {
      // avoids keyboard users being able to navigate to off-screen elements
      display: 'none',
    },
  },
};

const Drawer = ({ visible, ...props }) => (
  <Box
    as={motion.div}
    position="fixed"
    top={MENU_HEIGHT}
    left={0}
    height={`calc(100vh - ${MENU_HEIGHT}px)`}
    width="100%"
    bg="white"
    p={3}
    zIndex={10}
    overflowY="auto"
    {...props}
    // motion props
    variants={variants}
    animate={visible ? 'open' : 'closed'}
    transition={{
      ease: 'easeInOut',
      duration: 0.3,
    }}
    initial={false}
  />
);

Drawer.propTypes = {
  visible: PropTypes.bool,
};

export default Drawer;

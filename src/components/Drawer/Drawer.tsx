import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

import Box from '../Box';
import Portal from '../Portal';
import { css } from '@emotion/react';

const MENU_HEIGHT = 60; // px

const Drawer = ({ visible, animateFrom = 'left', zIndex, ...props }) => {
  const animateTo = animateFrom === 'right' ? 'left' : 'right';

  const variants = {
    open: {
      display: 'block',
      [animateTo]: '0%',
    },
    closed: {
      [animateTo]: '100%',
      transitionEnd: {
        // avoids keyboard users being able to navigate to off-screen elements
        display: 'none',
      },
    },
  };

  return (
    <Portal>
      <Box
        as={motion.div}
        position="fixed"
        top={MENU_HEIGHT}
        {...{
          [animateTo]: 0,
        }}
        height={`calc(100vh - ${MENU_HEIGHT}px)`}
        width="100%"
        bg="white"
        css={css`
          z-index: ${zIndex || 150};
        `}
        p={3}
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
    </Portal>
  );
};

// eslint-disable-next-line functional/immutable-data
Drawer.propTypes = {
  /** Determines whether the drawer is on screen */
  visible: PropTypes.bool,
  /** Direction to animate from */
  animateFrom: PropTypes.oneOf(['left', 'right']),
};

// eslint-disable-next-line functional/immutable-data
Drawer.defaultProps = {
  animateFrom: 'right',
};

/** @component */
export default Drawer;

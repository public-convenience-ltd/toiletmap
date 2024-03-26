import DrawerProps from './Drawer.types';

import { motion } from 'framer-motion';

const Drawer = ({ children, visible, animateFrom }: DrawerProps) => {
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
    <motion.div
      className="drawer"
      // motion props
      variants={variants}
      animate={visible ? 'open' : 'closed'}
      transition={{
        ease: 'easeInOut',
        duration: 0.3,
      }}
      initial={false}
    >
      {children}
    </motion.div>
  );
};

export default Drawer;

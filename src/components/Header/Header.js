import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Box from '../Box';
import VisuallyHidden from '../VisuallyHidden';
import { Media } from '../Media';
import Drawer from '../Drawer';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import Icon from '../Icon';

import Logo from './Logo';
import MainMenu from './MainMenu';

const Header = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      px={[3, 4]}
      py={2}
      bg="white"
      minHeight={60}
    >
      <Box flexShrink={0}>
        <Link to="/">
          <Logo />
        </Link>
      </Box>

      <Box as="nav" width="100%" aria-labelledby="menu-main">
        <h2 id="menu-main">
          <VisuallyHidden>Main menu</VisuallyHidden>
        </h2>

        <Box as={Media} at="sm" display="flex" justifyContent="flex-end">
          <button
            type="button"
            aria-expanded={isMenuVisible}
            onClick={() => setIsMenuVisible(!isMenuVisible)}
          >
            <VisuallyHidden>Toggle main menu</VisuallyHidden>
            <Icon icon={faBars} size="2x" />
          </button>

          <Drawer visible={isMenuVisible} zIndex={200}>
            <MainMenu children={children} />
          </Drawer>
        </Box>

        <Media greaterThan="sm">
          <MainMenu children={children} />
        </Media>
      </Box>
    </Box>
  );
};

export default Header;

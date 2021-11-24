import React, { useState } from 'react';
import Link from 'next/link';
import { faBars } from '@fortawesome/free-solid-svg-icons';

import Box from '../Box';
import VisuallyHidden from '../VisuallyHidden';
import { Media } from '../Media';
import Drawer from '../Drawer';
import Icon from '../Icon';
import Logo from '../Logo';

import MainMenu from './MainMenu';

const Header = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  return (
    <Box as="header">
      <Box
        display="flex"
        alignItems="center"
        px={[3, 4]}
        py={2}
        bg="white"
        minHeight={60}
      >
        <Box flexShrink={0}>
          <Link href="/" passHref>
            <a>
              <Logo />
            </a>
          </Link>
        </Box>

        <Box as="nav" width="100%" aria-labelledby="menu-main">
          <h2 id="menu-main">
            <VisuallyHidden>Main menu</VisuallyHidden>
          </h2>

          <Media at="sm" css={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              aria-expanded={isMenuVisible}
              onClick={() => setIsMenuVisible(!isMenuVisible)}
            >
              <VisuallyHidden>Toggle main menu</VisuallyHidden>
              <Icon icon={faBars} size="2x" />
            </button>

            <Drawer visible={isMenuVisible} zIndex={200}>
              <MainMenu onMenuItemClick={() => setIsMenuVisible(false)}>
                {children}
              </MainMenu>
            </Drawer>
          </Media>

          <Media greaterThan="sm">
            <MainMenu>{children}</MainMenu>
          </Media>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;

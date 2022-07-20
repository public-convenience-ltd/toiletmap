import React, { useCallback, useState } from 'react';
import { faBars, faComments } from '@fortawesome/free-solid-svg-icons';

import Box from '../Box';
import VisuallyHidden from '../VisuallyHidden';
import { Media } from '../Media';
import Drawer from '../Drawer';
import Icon from '../Icon';
import Logo from '../Logo';

import MainMenu from './MainMenu';
import { useMapState } from '../MapState';
import { useRouter } from 'next/router';
import Button from '../Button';
import {
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text as ChakraText,
} from '@chakra-ui/react';
import Feedback from '../Feedback/Feedback';

const Header = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const router = useRouter();
  const [, setMapState] = useMapState();
  const navigateAway = useCallback(() => {
    setMapState({ searchLocation: undefined, focus: undefined });
    router.push('/');
  }, [router, setMapState]);
  return (
    <Box as="header">
      <Box
        display="flex"
        alignItems="center"
        px={[3, 4]}
        py={2}
        bg="white"
        minHeight={'60px'}
      >
        <Box flexShrink={0}>
          <Button
            role="link"
            onClick={navigateAway}
            variant="link"
            aria-label="Navigate to the home page"
          >
            <Logo />
          </Button>
        </Box>

        <Box as="nav" width="100%" aria-labelledby="menu-main">
          <h2 id="menu-main">
            <VisuallyHidden>Main menu</VisuallyHidden>
          </h2>

          <Media at="sm" css={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Popover>
              <PopoverTrigger>
                <Box>
                  <button>
                    <Icon icon={faComments} size="2x" />

                    <ChakraText fontSize={'xs'}>Feedback</ChakraText>
                  </button>
                </Box>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverBody>
                  <Feedback />
                </PopoverBody>
              </PopoverContent>
            </Popover>

            <Box ml={4}>
              <button
                type="button"
                aria-expanded={isMenuVisible}
                onClick={() => setIsMenuVisible(!isMenuVisible)}
              >
                <VisuallyHidden>Toggle main menu</VisuallyHidden>
                <Icon icon={faBars} size="2x" />
              </button>
            </Box>

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

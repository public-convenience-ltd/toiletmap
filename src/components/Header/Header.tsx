import React, { useCallback, useState } from 'react';
import Link from 'next/link';

import Box from '../Box';
import { Media } from '../Media';
import Icon from '../../design-system/components/Icon';
import Logo from '../../design-system/components/Logo';
import VisuallyHidden from '../../design-system/utilities/VisuallyHidden';

import MainMenu from './MainMenu';
import { useMapState } from '../MapState';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';
import { useFeedbackPopover } from './hooks';
import Text from '../Text';

const Drawer = dynamic(() => import('../../design-system/components/Drawer'));

const Header = ({ children }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const router = useRouter();
  const [, setMapState] = useMapState();
  const navigateAway = useCallback(() => {
    setMapState({ searchLocation: undefined, focus: undefined });
    router.push('/');
  }, [router, setMapState]);

  const { feedbackPopoverId, handleClick, FeedbackPopover } =
    useFeedbackPopover();

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
          <Link
            role="link"
            onClick={navigateAway}
            href="/"
            aria-label="Navigate to the home page"
          >
            <Logo />
          </Link>
        </Box>

        <Box as="nav" width="100%" aria-labelledby="menu-main">
          <h2 id="menu-main">
            <VisuallyHidden as="span">Main menu</VisuallyHidden>
          </h2>

          <Media at="sm" css={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button aria-describedby={feedbackPopoverId} onClick={handleClick}>
              <Icon icon="comments" size="x-large" />
              <VisuallyHidden as="span">
                <Text>Feedback</Text>
              </VisuallyHidden>
            </button>

            <Box ml={4}>
              <button
                type="button"
                aria-expanded={isMenuVisible}
                onClick={() => setIsMenuVisible(!isMenuVisible)}
              >
                <VisuallyHidden as="span">Toggle main menu</VisuallyHidden>
                <Icon icon="bars" size="large" />
              </button>
            </Box>

            <FeedbackPopover />

            <Drawer visible={isMenuVisible} animateFrom="right">
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

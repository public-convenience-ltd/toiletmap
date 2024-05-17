import React from 'react';
import Link, { LinkProps } from 'next/link';
import styled from '@emotion/styled';
import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';
import { useUser } from '@auth0/nextjs-auth0';
import { useMapState } from '../MapState';
import Button from '../../design-system/components/Button';
import { useFeedbackPopover } from './hooks';

const StyledNavLink = styled(Link)<
  LinkProps & {
    onMouseEnter?: React.MouseEventHandler<Element> | undefined;
    onClick?: React.MouseEventHandler;
    href?: string | undefined;
    ref?: unknown;
  }
>`
  // active class is added by NavLink component
  &.active {
    color: ${(props) => props.theme.colors.tertiary};
  }
`;

interface IMainMenu {
  mapCenter?: { lat: number; lng: number };
  onMenuItemClick?: () => void;
  children: React.ReactElement;
}

const MainMenu = ({ children }: IMainMenu) => {
  const { user } = useUser();
  const [mapState] = useMapState();

  const { feedbackPopoverId, handleClick, FeedbackPopover } =
    useFeedbackPopover();

  return (
    <Text
      fontWeight="bold"
      textAlign={['center', 'left']}
      css={{
        height: '100%',
      }}
    >
      <Box
        display="flex"
        flexDirection={['column', 'row']}
        height={['100%', 'auto']}
      >
        <Box
          as="ul"
          display="flex"
          flexDirection={['column', 'row']}
          height={['100%', 'auto']}
          width="100%"
          alignItems="center"
        >
          <Box as="li" ml={[0, 4]}>
            <StyledNavLink href="/">Find a Toilet</StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} ml={[0, 4]}>
            <StyledNavLink
              href={
                mapState?.center
                  ? `/loos/add?lat=${mapState.center.lat}&lng=${mapState.center.lng}`
                  : `/loos/add`
              }
            >
              Add a Toilet
            </StyledNavLink>
          </Box>

          <Box as="li" mt={['auto', 0]} ml={[0, 'auto']}>
            <Media greaterThan="md">
              <Button
                aria-describedby={feedbackPopoverId}
                onClick={handleClick}
                htmlElement="button"
                variant="secondary"
                type="button"
              >
                Feedback
              </Button>
            </Media>

            <Media at="md">
              <Button
                aria-describedby={feedbackPopoverId}
                onClick={handleClick}
                htmlElement="button"
                variant="secondary"
                type="button"
              >
                Feedback
              </Button>
            </Media>
          </Box>

          <Box as="li" mt={['auto', 0]} ml={[0, 4]}>
            <StyledNavLink href="/about">About</StyledNavLink>
          </Box>

          <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
            <StyledNavLink href="/contact">Contact</StyledNavLink>
          </Box>

          <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
            <StyledNavLink href="/posts/hello-world">Blog</StyledNavLink>
          </Box>

          {user && (
            <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
              <a href={`/api/auth/logout`}>Logout</a>
            </Box>
          )}
        </Box>

        {children && (
          <Media lessThan="md">
            <Text fontWeight="normal">{children}</Text>
          </Media>
        )}

        <FeedbackPopover />
      </Box>
    </Text>
  );
};

export default MainMenu;

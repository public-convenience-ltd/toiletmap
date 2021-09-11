import React from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';
import { useUser } from '@auth0/nextjs-auth0';

const StyledNavLink = styled(Link)<
  LinkProps & {
    onMouseEnter?: React.MouseEventHandler<Element> | undefined;
    onClick: React.MouseEventHandler;
    href?: string | undefined;
    ref?: any;
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

// Todo: Contact link
const MainMenu = ({ mapCenter, onMenuItemClick, children }: IMainMenu) => {
  const { user } = useUser();
  const router = useRouter();

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
        >
          <Box as="li" ml={[0, 4]}>
            <StyledNavLink href="/">Find a Toilet</StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} ml={[0, 4]}>
            <StyledNavLink
              href={
                mapCenter
                  ? `/loos/add?lat=${mapCenter.lat}&lng=${mapCenter.lng}`
                  : `/loos/add`
              }
            >
              Add a Toilet
            </StyledNavLink>
          </Box>

          <Box as="li" mt={['auto', 0]} ml={[0, 'auto']}>
            <StyledNavLink href="/about">About</StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} ml={[0, 4]}>
            <StyledNavLink href="/use-our-loos">Our Sponsor</StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
            <StyledNavLink href="/contact">Contact</StyledNavLink>
          </Box>

          {user && (
            <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
              <StyledNavLink href="/api/auth/logout">Logout</StyledNavLink>
            </Box>
          )}
        </Box>

        {children && (
          <Media lessThan="md">
            <Text fontWeight="normal">{children}</Text>
          </Media>
        )}
      </Box>
    </Text>
  );
};

export default MainMenu;

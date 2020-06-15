import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';

import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';
import { useAuth } from '../../Auth';

const StyledNavLink = styled(Link)`
  // active class is added by NavLink component
  &.active {
    color: ${(props) => props.theme.colors.tertiary};
  }
`;

// Todo: Contact link
const MainMenu = ({
  mapCenter,
  onMenuItemClick = Function.prototype,
  children,
}) => {
  const { isAuthenticated, logout } = useAuth();
  const history = useRouter();

  const handleLogout = () => {
    logout();
    onMenuItemClick();
    history.push('/');
  };

  return (
    <Text
      fontWeight="bold"
      textAlign={['center', 'left']}
      css={{
        // fill container on mobile
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
            <StyledNavLink href="/" onClick={onMenuItemClick} exact>
              Find Toilet
            </StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} ml={[0, 4]}>
            <StyledNavLink
              href={
                mapCenter
                  ? `/loos/add?lat=${mapCenter.lat}&lng=${mapCenter.lng}`
                  : `/loos/add`
              }
              onClick={onMenuItemClick}
            >
              Add Toilet
            </StyledNavLink>
          </Box>

          <Box as="li" mt={['auto', 0]} ml={[0, 'auto']}>
            <StyledNavLink href="/about" onClick={onMenuItemClick}>
              About
            </StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} ml={[0, 4]}>
            <StyledNavLink href="/use-our-loos" onClick={onMenuItemClick}>
              Our Sponsor
            </StyledNavLink>
          </Box>
          <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
            <StyledNavLink href="/contact" onClick={onMenuItemClick}>
              Contact
            </StyledNavLink>
          </Box>

          {isAuthenticated() && (
            <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
              <button type="button" onClick={handleLogout}>
                Logout
              </button>
            </Box>
          )}
        </Box>

        {children && (
          <Box as={Media} lessThan="md">
            <Text fontWeight="normal">{children}</Text>
          </Box>
        )}
      </Box>
    </Text>
  );
};
MainMenu.propTypes = {
  // mobile footer
  children: PropTypes.any,
};

export default MainMenu;

import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';

import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';

const StyledNavLink = styled(NavLink)`
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
}) => (
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
        flexGrow={1}
      >
        <Box as="li" ml={[0, 4]}>
          <StyledNavLink to="/" onClick={onMenuItemClick} exact>
            Find Toilet
          </StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} ml={[0, 4]}>
          <StyledNavLink
            to={
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
          <StyledNavLink to="/about" onClick={onMenuItemClick}>
            About
          </StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} ml={[0, 4]}>
          <StyledNavLink to="/use-our-loos" onClick={onMenuItemClick}>
            Our Sponsor
          </StyledNavLink>
        </Box>
        <Box as="li" mt={[3, 0]} mb={['auto', 0]} ml={[0, 4]}>
          <StyledNavLink to="/contact" onClick={onMenuItemClick}>
            Contact
          </StyledNavLink>
        </Box>
      </Box>

      {children && (
        <Box as={Media} lessThan="md">
          <Text fontWeight="normal">{children}</Text>
        </Box>
      )}
    </Box>
  </Text>
);
MainMenu.propTypes = {
  // mobile footer
  children: PropTypes.any,
};

export default MainMenu;

import React from 'react';
import styled from '@emotion/styled';
import { Link, withRouter } from 'react-router-dom';

import logo from '../images/logo.svg';

import Box from './Box';
import Text from './Text';

const Logo = styled((props) => (
  <img {...props} src={logo} alt="The Great British Toilet Map" />
))`
  height: 2rem;
`;

// Todo: Contact link
// Todo: Update logo
const Header = () => {
  return (
    <Box
      as="header"
      display="flex"
      alignItems="center"
      px={4}
      py={2}
      bg="white"
      color="primary"
      minHeight="60px"
    >
      <Link to="/">
        <Logo />
      </Link>

      <Text fontWeight="bold" width="100%">
        <nav>
          <Box as="ul" display="flex">
            <Box as="li" ml={4}>
              <Link to="/">Find Loo</Link>
            </Box>
            <Box as="li" ml={4}>
              <Link to="/report">Add Loo</Link>
            </Box>

            <Box as="li" ml="auto">
              <Link to="/About">About</Link>
            </Box>
            <Box as="li" ml={4}>
              <Link to="/use-our-loos">Our Sponsor</Link>
            </Box>
            <Box as="li" ml={4}>
              <Link to="">Contact</Link>
            </Box>
          </Box>
        </nav>
      </Text>
    </Box>
  );
};

export default withRouter(Header);

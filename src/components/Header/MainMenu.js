import React from 'react';
import { Link } from 'react-router-dom';

import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';
import Footer from '../Footer';

// Todo: Contact link
const MainMenu = () => (
  <Text
    fontWeight="bold"
    textAlign={['center', 'left']}
    css={{
      // fill container on mobile
      height: '100%',
    }}
  >
    <Box
      as="ul"
      display="flex"
      flexDirection={['column', 'row']}
      height={['100%', 'auto']}
    >
      <Box as="li" ml={[0, 4]}>
        <Link to="/">Find Loo</Link>
      </Box>
      <Box as="li" mt={[3, 0]} ml={[0, 4]}>
        <Link to="/report">Add Loo</Link>
      </Box>

      <Box as="li" mt={['auto', 0]} ml={[0, 'auto']}>
        <Link to="/about">About</Link>
      </Box>
      <Box as="li" mt={[3, 0]} ml={[0, 4]}>
        <Link to="/use-our-loos">Our Sponsor</Link>
      </Box>
      <Box as="li" mt={[3, 0]} ml={[0, 4]}>
        <Link to="">Contact</Link>
      </Box>

      <Box as={Media} lessThan="md" mt="auto">
        <Text fontWeight="normal">
          <Footer />
        </Text>
      </Box>
    </Box>
  </Text>
);

export default MainMenu;

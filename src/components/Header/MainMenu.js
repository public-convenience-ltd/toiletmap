import React from 'react';
import { Link } from 'react-router-dom';

import Box from '../Box';
import Text from '../Text';
import { Media } from '../Media';
import Footer from '../Footer';

const MENU_HEIGHT = 60; // px

// Todo: Contact link
const MainMenu = (props) => (
  <Text fontWeight="bold" textAlign={['center', 'left']}>
    <Box
      position={['fixed', 'static']}
      top={MENU_HEIGHT}
      left={0}
      height={[`calc(100vh - ${MENU_HEIGHT}px)`, 'auto']}
      width="100%"
      bg="white"
      p={[3, 0]}
      zIndex={10000}
      overflowY="auto"
      {...props}
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
          <Link to="/About">About</Link>
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
    </Box>
  </Text>
);

export default MainMenu;

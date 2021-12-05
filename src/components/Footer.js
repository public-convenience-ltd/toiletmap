import React from 'react';
import { Link } from 'react-router-dom';

import Box from './Box';
import Text from './Text';

const Footer = ({ children }) => (
  <Box
    as="footer"
    display="flex"
    flexDirection={['column', 'row']}
    justifyContent="space-between"
    alignItems="center"
    px={[3, 4]}
    py={[0, 2]}
    bg={['transparent', 'lightGrey']}
    color="primary"
    height={['auto', 60]}
  >
    <Box order={[-1, 0]} mb={[4, 0]}>
      <Text fontSize={[12, 16]}>
        <Box as="ul" display={['block', 'flex']} alignItems="center">
          {React.Children.map(children, (child, index) => (
            <li key={index}>{child}</li>
          ))}

          <Box as="li" ml={[0, 4]}>
            <Link to="/privacy">Privacy Policy</Link>
          </Box>
        </Box>
      </Text>
    </Box>
  </Box>
);

export default Footer;

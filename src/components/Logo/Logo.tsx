import React from 'react';

import Image from 'next/image';
import logo from './logo.svg';
import Box from '../Box';

const Logo = (props) => (
  <Box width="150px">
    <Image
      src={logo}
      alt="The Great British Toilet Map"
      layout="responsive"
      {...props}
    />
  </Box>
);

export default Logo;

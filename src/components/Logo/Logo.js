import React from 'react';

import Box from '../Box';

import logo from './logo.svg';

const Logo = (props) => (
  <Box
    as="img"
    src={logo}
    alt="The Great British Toilet Map"
    height={[30, 36]}
    {...props}
  />
);

export default Logo;

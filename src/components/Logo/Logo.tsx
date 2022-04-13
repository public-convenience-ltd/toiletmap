import React from 'react';

import Image from 'next/image';
import Box from '../Box';
import logo from '../../../public/logo.svg';

const Logo = React.forwardRef<HTMLDivElement>((props, ref) => (
  <Box width="150px" ref={ref}>
    <Image
      src={logo}
      alt="The Great British Toilet Map"
      layout="responsive"
      unoptimized={!!process.env.STORYBOOK}
      {...props}
    />
  </Box>
));

// eslint-disable-next-line functional/immutable-data
Logo.displayName = 'Logo';

export default Logo;

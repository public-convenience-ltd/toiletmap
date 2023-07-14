import React from 'react';

import Image from 'next/image';
import Box from '../Box';
import logo from '../../../public/logo.svg';

const Logo = React.forwardRef<HTMLDivElement>((props, ref) => (
  <Box width="154px" ref={ref}>
    <Image
      src={logo}
      alt="The Great British Toilet Map"
      unoptimized={!!process.env.STORYBOOK}
      priority={true}
      {...props}
      sizes="100vw"
      style={{
        width: "100%",
        height: "auto"
      }}
    />
  </Box>
));

// eslint-disable-next-line functional/immutable-data
Logo.displayName = 'Logo';

export default Logo;

import React from 'react';
import Image from 'next/image';
import logo from '../../../../public/logo.svg';

const Logo = React.forwardRef<HTMLDivElement>((props, ref) => (
  <div className="logo" ref={ref}>
    <Image
      src={logo}
      alt="Toilet Map"
      unoptimized={!!process.env.STORYBOOK}
      priority={true}
      {...props}
    />
  </div>
));

// eslint-disable-next-line functional/immutable-data
Logo.displayName = 'Logo';

export default Logo;

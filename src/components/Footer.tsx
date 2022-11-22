import React from 'react';
import Link from 'next/link';

import Box from './Box';
import Text from './Text';
import Image from 'next/legacy/image';

import poweredByVercel from '../../public/powered-by-vercel.svg';

const Footer = ({ children = null }) => {
  return (
    <Box
      as="footer"
      display="flex"
      flexDirection={['row']}
      justifyContent="space-between"
      alignItems="center"
      px={[3, 4]}
      py={[0, 2]}
      bg={['transparent', 'lightGrey']}
      color="primary"
      height={['auto', '60px']}
    >
      <Box order={[-1, 0]} mb={[0]}>
        <Text fontSize={[12, 16]}>
          <Box as="ul" display={['flex']} alignItems="center">
            {React.Children.map(children, (child, index) => (
              <li key={index}>{child}</li>
            ))}

            <Box as="li" ml={[0, 4]}>
              <Link href="/privacy">Privacy Policy</Link>
            </Box>
            <Box as="li" ml={[2, 4]}>
              <Link href="/explorer">Explorer</Link>
            </Box>
          </Box>
        </Text>
      </Box>
      <Box display="flex">
        <Link
          href={
            'https://vercel.com/?utm_source=public-convenience-ltd&utm_campaign=oss'
          }
          passHref
          legacyBehavior
        >
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Box
            as="a"
            display={'flex'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              width="130"
              src={poweredByVercel}
              alt="Powered by Vercel"
              unoptimized={!!process.env.STORYBOOK}
            />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;

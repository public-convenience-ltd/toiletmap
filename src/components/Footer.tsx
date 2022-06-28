import React from 'react';
import Link from 'next/link';

import Box from './Box';
import Text from './Text';
import Image from 'next/image';

import poweredByVercel from '../../public/powered-by-vercel.svg';

const Footer = ({ children = null }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return (
    mounted && (
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
        height={['auto', '60px']}
      >
        <Box order={[-1, 0]} mb={[4, 0]}>
          <Text fontSize={[12, 16]}>
            <Box as="ul" display={['block', 'flex']} alignItems="center">
              {React.Children.map(children, (child, index) => (
                <li key={index}>{child}</li>
              ))}

              <Box as="li" ml={[0, 4]}>
                <Link href="/privacy">Privacy Policy</Link>
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
          >
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <Box
              as="a"
              display={'flex'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image src={poweredByVercel} alt="Powered by Vercel" />
            </Box>
          </Link>
        </Box>
      </Box>
    )
  );
};

export default Footer;

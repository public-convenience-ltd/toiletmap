import React from 'react';
import Link from 'next/link';
import styled from '@emotion/styled';

import Box from './Box';
import Text from './Text';
import Image from 'next/image';
import domestosLogo from '../../public/domestos_logo3.png';
import domestosUseLoos from '../../public/domestos_use_our_loos_logo.png';

const DomestosLogo = (props) => (
  <Box height="2rem" width="2rem">
    <Image {...props} layout="responsive" src={domestosLogo} alt="Domestos" />
  </Box>
);

const UseOurLoosLogo = (props) => (
  <Box height="2rem" width="2rem">
    <Image
      {...props}
      src={domestosUseLoos}
      layout="responsive"
      quality={100}
      alt="Domestos: Use our loos"
    />
  </Box>
);

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
        f
        bg={['transparent', 'lightGrey']}
        color="primary"
        height={['auto', 60]}
      >
        <Link
          passHref
          href="/use-our-loos"
          title="Domestos: Use Our Loos Campaign"
          scroll={true}
        >
          <a>
            <Box
              display="flex"
              flexDirection={['column', 'row']}
              alignItems="center"
            >
              <Text fontSize={14}>
                <small>Proudly sponsored by Domestos</small>
              </Text>

              <Box display="flex" ml={[0, 3]} mb={[3, 0]} order={[-1, 0]}>
                <UseOurLoosLogo />
                <Box ml={2}>
                  <DomestosLogo />
                </Box>
              </Box>
            </Box>
          </a>
        </Link>

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
      </Box>
    )
  );
};

export default Footer;

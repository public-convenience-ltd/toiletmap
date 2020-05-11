import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styled from '@emotion/styled';

import Box from './Box';

import config from '../config';

import domestosLogo from '../images/domestos_logo3.png';
import domestosUseLoos from '../images/domestos_use_our_loos_logo.png';

const DomestosLogo = styled((props) => (
  <img {...props} src={domestosLogo} alt="Domestos" />
))`
  height: 2rem;
`;

const UseOurLoosLogo = styled((props) => (
  <img {...props} src={domestosUseLoos} alt="Domestos: Use our loos" />
))`
  height: 2rem;
`;

// Todo: Link Cookie Policy
const Footer = (props) => (
  <Box
    as="footer"
    display={['block', 'flex']}
    justifyContent="space-between"
    alignItems="center"
    px={4}
    py={2}
    bg="grey"
    color="primary"
    minHeight="60px"
  >
    {config.shouldShowSponsor() && (
      <HashLink
        to="/use-our-loos"
        title="Domestos: Use Our Loos Campaign"
        scroll={(el) => el.scrollIntoView(true)}
      >
        <Box display="flex" alignItems="center">
          Proudly sponsored by Domestos
          <Box ml={3}>
            <UseOurLoosLogo />
          </Box>
          <Box ml={2}>
            <DomestosLogo />
          </Box>
        </Box>
      </HashLink>
    )}

    <Box as="ul" display={['block', 'flex']}>
      <li>Cookie Policy</li>
      <Box as="li" ml={[0, 4]}>
        <Link to="/privacy">Privacy Policy</Link>
      </Box>
    </Box>
  </Box>
);

export default withRouter(Footer);

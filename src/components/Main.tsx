// Polyfills
import 'resize-observer-polyfill';

import React from 'react';
import Box from '../components/Box';
import Header from '../design-system/components/Header';
import Footer from '../components/Footer';

const Main = ({ Component, pageProps, map = undefined }) => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Header />
      <Box position="relative" display="flex" flexGrow={1}>
        <Box
          as="main"
          flexGrow={1}
          // support screen readers in ie11
          role="main"
        >
          {map ? (
            <Box height="100%" display="flex" position="relative">
              <Component {...pageProps} />
              {map}
            </Box>
          ) : (
            <Component {...pageProps} />
          )}
        </Box>
      </Box>

      <Box mt="auto">
        <Footer />
      </Box>
    </Box>
  );
};

export default Main;

import { ChakraProvider } from '@chakra-ui/react';
import { ThemeProvider } from '@emotion/react';
import PlausibleProvider from 'next-plausible';
import React, { useEffect, useState } from 'react';
import globalStyles from '../globalStyles';
import theme from '../theme';
import { MapStateProvider } from './MapState';
import { MediaContextProvider } from './Media';

const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [disableDynamicMediaQueries, setDisableDynamicMediaQueries] =
    useState(true);

  // Only enable dynamic media queries once the document has been hydrated.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDisableDynamicMediaQueries(false);
    }
  }, [disableDynamicMediaQueries]);

  return (
    <PlausibleProvider
      domain="toiletmap.org.uk"
      customDomain="https://stats.toiletmap.org.uk/"
    >
      <MapStateProvider>
        <ChakraProvider resetCSS={false}>
          {globalStyles}
          <ThemeProvider theme={theme}>
            <MediaContextProvider
              disableDynamicMediaQueries={disableDynamicMediaQueries}
            >
              {children}
            </MediaContextProvider>
          </ThemeProvider>
        </ChakraProvider>
      </MapStateProvider>
    </PlausibleProvider>
  );
};

export default Providers;

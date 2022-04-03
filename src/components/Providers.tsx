import { UserProvider } from '@auth0/nextjs-auth0';
import { ThemeProvider } from '@emotion/react';
import PlausibleProvider from 'next-plausible';
import React, { useEffect, useState } from 'react';
import globalStyles from '../globalStyles';
import theme from '../theme';
import { MapStateProvider } from './MapState';
import { MediaContextProvider } from './Media';

const Providers: React.FC = ({ children }) => {
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
      <UserProvider>
        <MapStateProvider>
          <ThemeProvider theme={theme}>
            {globalStyles}
            <MediaContextProvider
              disableDynamicMediaQueries={disableDynamicMediaQueries}
            >
              {children}
            </MediaContextProvider>
          </ThemeProvider>
        </MapStateProvider>
      </UserProvider>
    </PlausibleProvider>
  );
};

export default Providers;

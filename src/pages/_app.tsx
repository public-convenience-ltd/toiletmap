// Polyfills
import 'resize-observer-polyfill';

import { UserProvider } from '@auth0/nextjs-auth0';
import { MapStateProvider } from '../components/MapState';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from '@emotion/react';
import Box from '../components/Box';
import { MediaContextProvider, Media } from '../components/Media';
import Header from '../components/Header';
import Footer from '../components/Footer';
import globalStyles from '../globalStyles';
import theme from '../theme';

const App = ({ Component, pageProps }) => (
  <PlausibleProvider
    domain="toiletmap.org.uk"
    customDomain="https://stats.toiletmap.org.uk/"
  >
    <UserProvider>
      <MapStateProvider>
        <ThemeProvider theme={theme}>
          <MediaContextProvider>
            {globalStyles}

            <Box display="flex" flexDirection="column" height="100%">
              <Header>
                <Footer />
              </Header>

              <Box position="relative" display="flex" flexGrow={1}>
                <Box
                  as="main"
                  flexGrow={1}
                  // support screen readers in ie11
                  role="main"
                >
                  <Component {...pageProps} />
                </Box>
              </Box>

              <Box mt="auto">
                <Media greaterThan="sm">
                  <Footer />
                </Media>
              </Box>
            </Box>
          </MediaContextProvider>
        </ThemeProvider>
      </MapStateProvider>
    </UserProvider>
  </PlausibleProvider>
);

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from 'emotion-theming';

import Box from './Box';
import { MediaContextProvider, Media } from './Media';
import Header from './Header';
import Footer from './Footer';
import TrackingBanner from './Tracking/TrackingBanner';

import globalStyles from '../globalStyles';
import theme from '../theme';
import config from '../config';

import { TRACKING_STORAGE_KEY } from './Tracking';

const PageLayout = ({ mapCenter, children }) => {
  const trackingRef = useRef(null);

  const [isTrackingStateChosen, setIsTrackingStateChosen] = useState(
    config.getSetting(TRACKING_STORAGE_KEY, 'trackingStateChosen')
  );

  // stored indepedently from isTrackingStateChosen state since we should not programmatically
  // update focus on the initial render
  const [showTrackingBanner, setShowTrackingBanner] = useState(false);

  useEffect(() => {
    // programmatically focus the banner header when its presence is initiated by the user
    if (showTrackingBanner) {
      setTimeout(() => {
        trackingRef.current.focus();
      }, 0);
    }
  }, [showTrackingBanner]);

  const footerFragment = (
    <Footer>
      <button
        type="button"
        aria-expanded={showTrackingBanner}
        onClick={() => setShowTrackingBanner(true)}
      >
        Cookie Preferences
      </button>
    </Footer>
  );

  return (
    <ThemeProvider theme={theme}>
      <MediaContextProvider>
        {globalStyles}

        {(!isTrackingStateChosen || showTrackingBanner) && (
          <TrackingBanner
            ref={trackingRef}
            onClose={() => setIsTrackingStateChosen(false)}
          />
        )}

        <Box display="flex" flexDirection="column" height="100%">
          <Header mapCenter={mapCenter}>{footerFragment}</Header>

          <Box position="relative" display="flex" flexGrow={1} overflowY="auto">
            <Box
              as="main"
              flexGrow={1}
              children={children}
              // support screen readers in ie11
              role="main"
            />
          </Box>

          <Box mt="auto">
            <Media greaterThan="sm">{footerFragment}</Media>
          </Box>
        </Box>
      </MediaContextProvider>
    </ThemeProvider>
  );
};

export default PageLayout;

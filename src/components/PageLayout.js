import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { Global, css } from '@emotion/core';

import Box from './Box';
import { MediaContextProvider, Media } from './Media';
import Header from './Header';
import Footer from './Footer';
import TrackingBanner from './Tracking/TrackingBanner';

import theme from '../theme';
import config from '../config';

import { TRACKING_STORAGE_KEY } from './Tracking';

import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-loading/src/Control.Loading.css';

// based on https://hankchizljaw.com/wrote/a-modern-css-reset
const ResetStyles = (
  <Global
    styles={css`
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      *:focus {
        outline: 1px dotted currentColor;
        outline-offset: 0.5rem;
      }

      /* remove default padding */
      ul,
      ol,
      button,
      fieldset {
        padding: 0;
      }

      /* remove default margin */
      body,
      h1,
      h2,
      h3,
      h4,
      p,
      ul,
      ol,
      li,
      figure,
      figcaption,
      blockquote,
      dl,
      dd,
      fieldset {
        margin: 0;
      }

      :root,
      #root {
        height: 100%;
      }

      /* set core body defaults */
      body {
        height: 100%;
        scroll-behavior: smooth;
        text-rendering: optimizeSpeed;
        line-height: 1.5;
        font-family: 'Open Sans', sans-serif;
        color: ${theme.colors.primary};
      }

      /* remove list styles on ul, ol elements */
      ul,
      ol {
        list-style: none;
      }

      /* have link and buttons be indistinguishable */
      a,
      button {
        color: inherit;
        cursor: pointer;
      }

      a {
        text-decoration: none;
      }

      button {
        border: none;
        background: none;
      }

      /* make images easier to work with */
      img {
        max-width: 100%;
        display: block;
      }

      /* natural flow and rhythm in articles by default */
      article > * + * {
        margin-top: 1em;
      }

      /* inherit fonts for inputs and buttons */
      input,
      button,
      textarea,
      select {
        font: inherit;
      }

      label {
        cursor: pointer;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font: inherit;
      }

      fieldset {
        border: 0;
      }

      th {
        text-align: left;
        font-weight: normal;
        vertical-align: bottom;
      }

      p + p {
        margin-top: 1em;
      }

      a:hover,
      a:focus,
      button:hover,
      button:focus {
        color: ${theme.colors.tertiary};
        transition: all 0.2s ease;
      }

      [hidden] {
        display: none !important;
      }

      [inert] {
        opacity: 0.25;
      }

      ::-webkit-input-placeholder {
        color: ${theme.colors.primary};
      }

      :-ms-input-placeholder {
        color: ${theme.colors.primary};
      }

      ::placeholder {
        color: ${theme.colors.primary};
      }

      /* remove all animations and transitions for people that prefer not to see them */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }
    `}
  />
);

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
        {ResetStyles}

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

import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';
import { Global, css } from '@emotion/core';

import Box from './Box';
import { MediaContextProvider, Media } from './Media';
import Header from './Header';
import Footer from './Footer';

import theme from '../theme';

// import { TRACKING_STORAGE_KEY } from './Tracking';
// import TrackingPreferences from './Tracking/TrackingPreferences';

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

      /* remove default padding */
      ul[class],
      ol[class] {
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
      dd {
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
      }

      /* remove list styles on ul, ol elements */
      ul,
      ol {
        list-style: none;
      }

      /* have link and buttons be indistinguishable */
      a,
      button {
        all: unset;
        cursor: pointer;
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

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font: inherit;
      }

      [hidden] {
        display: none !important;
      }

      [inert] {
        opacity: 0.25;
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

const PageLayout = (props) => {
  // const mainRef = React.useRef();

  // const [isCookieSettingsOpen, setIsCookieSettingsOpen] = React.useState(
  //   !config.getSetting(TRACKING_STORAGE_KEY, 'trackingStateChosen')
  // );

  // React.useEffect(() => {
  //   if (mainRef.current && isCookieSettingsOpen) {
  //     mainRef.current.scrollTop = 0;
  //   }
  // }, [mainRef, isCookieSettingsOpen]);

  return (
    <ThemeProvider theme={theme}>
      <MediaContextProvider>
        {ResetStyles}

        <Box display="flex" flexDirection="column" height="100%">
          <Header />

          {props.children}

          <Box as={Media} greaterThan="sm" mt="auto">
            <Footer
            // onCookieBoxButtonClick={() =>
            //   setIsCookieSettingsOpen(!isCookieSettingsOpen)
            // }
            // isCookieSettingsOpen={isCookieSettingsOpen}
            />
          </Box>
        </Box>
      </MediaContextProvider>
    </ThemeProvider>
  );
};

PageLayout.propTypes = {
  main: PropTypes.element,
  map: PropTypes.element,
};

export default PageLayout;

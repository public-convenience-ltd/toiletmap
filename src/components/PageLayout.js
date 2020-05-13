import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider } from 'emotion-theming';
import { Global, css } from '@emotion/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import Box from './Box';
import Text from './Text';
import Button from './Button';
import { MediaContextProvider, Media } from './Media';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import LocationSearch from './LocationSearch';
import Drawer from './Drawer';
import Filters from './Filters';

import theme from '../theme';
import config, { FILTERS_KEY } from '../config';

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
      ul,
      ol {
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

      p + p {
        margin-top: 1em;
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
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  // const mainRef = React.useRef();

  // const [isCookieSettingsOpen, setIsCookieSettingsOpen] = React.useState(
  //   !config.getSetting(TRACKING_STORAGE_KEY, 'trackingStateChosen')
  // );

  // React.useEffect(() => {
  //   if (mainRef.current && isCookieSettingsOpen) {
  //     mainRef.current.scrollTop = 0;
  //   }
  // }, [mainRef, isCookieSettingsOpen]);

  let initialState = config.getSettings(FILTERS_KEY);

  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialState[filter.id] = initialState[filter.id] || false;
  });

  const [filters, setFilters] = useState(initialState);

  // keep local storage and state in sync
  React.useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  return (
    <ThemeProvider theme={theme}>
      <MediaContextProvider>
        <Box display="flex" flexDirection="column" height="100%">
          {ResetStyles}

          <Header />

          <Box position="relative" flexGrow={1}>
            <Box as="main" height="100%" children={props.children} />

            <aside>
              <Box
                as={Media}
                lessThan="md"
                position="absolute"
                top={0}
                left={0}
                p={3}
                width="100%"
              >
                <LocationSearch />

                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="secondary"
                    icon={<FontAwesomeIcon icon={faFilter} />}
                    aria-expanded={isFiltersExpanded}
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  >
                    Filter Map
                  </Button>
                </Box>

                <Drawer visible={isFiltersExpanded}>
                  <Box display="flex" justifyContent="space-between" mb={4}>
                    <Box display="flex" alignItems="flex-end">
                      <FontAwesomeIcon icon={faFilter} fixedWidth size="lg" />
                      <Box as="h2" mx={2}>
                        <Text lineHeight={1}>
                          <b>Filter</b>
                        </Text>
                      </Box>
                    </Box>

                    <Text fontSize={12}>
                      <Box
                        as="button"
                        type="button"
                        onClick={() => setFilters({})}
                        border={0}
                        borderBottom={2}
                        borderStyle="solid"
                      >
                        Reset Filter
                      </Box>
                    </Text>
                  </Box>

                  <Filters filters={filters} onFilterChange={setFilters} />

                  <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                      onClick={() => setIsFiltersExpanded(false)}
                      css={{
                        width: '100%',
                      }}
                    >
                      Done
                    </Button>
                  </Box>
                </Drawer>
              </Box>

              <Media greaterThan="sm">
                <Sidebar filters={filters} onFilterChange={setFilters} />
              </Media>
            </aside>
          </Box>

          <Box as={Media} greaterThan="sm" mt="auto">
            <Footer
            // onCookieBoxButtonClick={() =>
            //   setIsCookieSettingsOpen(!isCookieSettingsOpen)
            // }
            // isCookieSettingsOpen={isCookieSettingsOpen}
            />
          </Box>

          {/*<TrackingPreferences
            isOpen={isCookieSettingsOpen}
            onClose={() => setIsCookieSettingsOpen(false)}
          />*/}
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

import React from 'react';
import NextApp from 'next/app';
import { CacheProvider } from '@emotion/core';
import { cache } from 'emotion';
import { ThemeProvider } from 'emotion-theming';
import { SWRConfig } from 'swr';

import { MediaContextProvider } from '../components/Media';
import theme from '../theme';
import resetStyles from '../resetStyles';

import AuthProvider from '../Auth';
import fetcher from '../graphql/fetcher';
import { MapStateProvider } from '../components/MapState';

import 'leaflet/dist/leaflet.css';

export default class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <MediaContextProvider>
          <CacheProvider value={cache}>
            {resetStyles}
            <AuthProvider>
              <SWRConfig
                value={{
                  fetcher,
                }}
              >
                <MapStateProvider>
                  <Component {...pageProps} />
                </MapStateProvider>
              </SWRConfig>
            </AuthProvider>
          </CacheProvider>
        </MediaContextProvider>
      </ThemeProvider>
    );
  }
}

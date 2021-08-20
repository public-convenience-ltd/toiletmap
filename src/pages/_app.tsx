// Polyfills
import 'resize-observer-polyfill';

import React from 'react';
import { SWRConfig } from 'swr';
import { UserProvider } from '@auth0/nextjs-auth0';

import fetcher from '../graphql/fetcher';
import { MapStateProvider } from '../components/MapState';

const App = ({Component, pageProps}) => (
  <UserProvider>
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <MapStateProvider>
        <Component {...pageProps} />
      </MapStateProvider>
    </SWRConfig>
  </UserProvider>
)

export default App;

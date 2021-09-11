// Polyfills
import 'resize-observer-polyfill';

import React from 'react';
import { UserProvider } from '@auth0/nextjs-auth0';
import { MapStateProvider } from '../components/MapState';

const App = ({Component, pageProps}) => (
  <UserProvider>
    <MapStateProvider>
      <Component {...pageProps} />
    </MapStateProvider>
  </UserProvider>
)

export default App;

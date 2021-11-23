// Polyfills
import 'resize-observer-polyfill';

import { UserProvider } from '@auth0/nextjs-auth0';
import { MapStateProvider } from '../components/MapState';
import PlausibleProvider from 'next-plausible';

const App = ({ Component, pageProps }) => (
  <PlausibleProvider
    domain="toiletmap.org.uk"
    customDomain="https://stats.toiletmap.org.uk/"
  >
    <UserProvider>
      <MapStateProvider>
        <Component {...pageProps} />
      </MapStateProvider>
    </UserProvider>
  </PlausibleProvider>
);

export default App;

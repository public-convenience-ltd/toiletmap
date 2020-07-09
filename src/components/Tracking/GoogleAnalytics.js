import React from 'react';
import ReactGA from 'react-ga';
import Fingerprint2 from 'fingerprintjs2';
import { useLocation } from 'react-router-dom';

import config from '../../config';

const GoogleAnalytics = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    async function startGA() {
      // Compute a fingerprint so we can avoid using cookies
      const ident = await Fingerprint2.getPromise();
      const components = ident.map((c) => c.value);
      // Make this _our_ fingerprint
      components.push('publicconvenience');
      const murmur = Fingerprint2.x64hash128(components.join(''), 31);

      ReactGA.initialize(config.analyticsId, {
        gaOptions: {
          storage: 'none',
          clientId: murmur,
        },
      });
      ReactGA.ga('set', 'anonymizeIp', true);
      setIsInitialized(true);
    }
    if (config.analyticsId) {
      startGA();
    }
  }, []);

  const { pathname } = useLocation();

  React.useEffect(() => {
    if (isInitialized) {
      ReactGA.pageview(pathname);
    }
  }, [pathname, isInitialized]);

  return null;
};

export default GoogleAnalytics;

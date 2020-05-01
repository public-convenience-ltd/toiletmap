import React from 'react';
import ReactGA from 'react-ga';

import config from '../../config';
import useOnLocationChange from './useOnLocationChange';

const startGA = () => {
  ReactGA.initialize(config.analyticsId);
};

const GoogleAnalytics = () => {
  React.useEffect(() => {
    startGA();
  }, []);

  const onLocationChange = React.useCallback(
    (pathname) => ReactGA.pageview(pathname),
    []
  );

  useOnLocationChange(onLocationChange);

  return null;
};

export default GoogleAnalytics;

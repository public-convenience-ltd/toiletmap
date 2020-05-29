import React, { lazy } from 'react';

import config from '../../config';
import AdobeTracking from './AdobeTracking';
import { TRACKING_STORAGE_KEY } from './';

const GoogleAnalytics = lazy(() => import('./GoogleAnalytics'));

const Tracking = () => {
  const isAaAccepted = config.getSetting(TRACKING_STORAGE_KEY, 'aaAccepted');
  const isGaAccepted = config.getSetting(TRACKING_STORAGE_KEY, 'gaAccepted');

  return (
    <>
      {isAaAccepted && <AdobeTracking />}
      {isGaAccepted && <GoogleAnalytics />}
    </>
  );
};

export default Tracking;

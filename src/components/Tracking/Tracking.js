import React from 'react';

import config from '../../config';
import GoogleAnalytics from './GoogleAnalytics';
import AdobeTracking from './AdobeTracking';
import { TRACKING_STORAGE_KEY } from './';

const Tracking = () => {
  const isAaAccepted = config.getSetting(TRACKING_STORAGE_KEY, 'aaAccepted');

  return (
    <>
      {isAaAccepted && <AdobeTracking />}
      <GoogleAnalytics />
    </>
  );
};

export default Tracking;

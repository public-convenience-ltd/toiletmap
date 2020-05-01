import React from 'react';
import { Helmet } from 'react-helmet';

import config from '../../config';
import useOnLocationChange from './useOnLocationChange';

const AdobeTracking = () => {
  const onLocationChange = React.useCallback(() => {
    // Check if tracking has been initialised
    if (window.digitalData && window.s) {
      // Set tracking page attributes
      window.digitalData.page.pageInfo.pageName = `${document.title}`;
      window.digitalData.page.attributes.contentType = '200';
      // Fire tracking event
      window.s.t();
    }
  }, []);

  useOnLocationChange(onLocationChange);

  return (
    <Helmet>
      <script
        src={
          config.getStage() === 'production'
            ? `${process.env.PUBLIC_URL}/adobe-digital-data.js`
            : `${process.env.PUBLIC_URL}/adobe-digital-data-stage.js`
        }
      />
      <script
        src="//assets.adobedtm.com/launch-EN896f27c113614ed9a3a705dc289c6887-staging.min.js"
        async
      />
    </Helmet>
  );
};

export default AdobeTracking;

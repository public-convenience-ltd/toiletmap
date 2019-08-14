import React from 'react';

import { Helmet } from 'react-helmet';

import config from '../../config';

export const Staging = () => (
  <Helmet>
    <script src={`${process.env.PUBLIC_URL}/adobe-digital-data.js`} />
    <script
      src="//assets.adobedtm.com/launch-EN896f27c113614ed9a3a705dc289c6887-staging.min.js"
      async
    />
  </Helmet>
);

export const Production = () => (
  <Helmet>
    <script src={`${process.env.PUBLIC_URL}/adobe-digital-data.js`} />
    <script
      src="//assets.adobedtm.com/launch-EN896f27c113614ed9a3a705dc289c6887-staging.min.js"
      async
    />
  </Helmet>
);

export default () => {
  if (config.getStage() === 'production') {
    return <Production />;
  }

  if (config.getStage() === 'staging') {
    return <Staging />;
  }

  return null;
};

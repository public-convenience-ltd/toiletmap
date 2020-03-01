import React from 'react';
import { HashRouter, Router } from 'react-router-dom';
import config from './config';

export default ({ history, ...props }) => {
  if (config.isNativeApp()) {
    // hash router doesn't accept the history prop
    return <HashRouter {...props} />;
  }

  return <Router history={history} {...props} />;
};

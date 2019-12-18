import React from 'react';
import { HashRouter, Router } from 'react-router-dom';

export default ({ history, ...props }) => {
  if (window.cordova) {
    // hash router doesn't accept the history prop
    return <HashRouter {...props} />;
  }

  return <Router history={history} {...props} />;
};

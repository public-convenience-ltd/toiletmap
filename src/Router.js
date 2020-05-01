import React from 'react';
import { Router } from 'react-router-dom';

export default ({ history, ...props }) => {
  return <Router history={history} {...props} />;
};

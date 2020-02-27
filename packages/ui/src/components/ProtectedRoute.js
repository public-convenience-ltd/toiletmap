import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({
  auth,
  component: Component,
  injectProps,
  ...rest
}) => (
  <Route
    {...rest}
    render={props => {
      if (auth.isAuthenticated()) {
        return <Component {...props} {...injectProps} />;
      } else {
        auth.redirectOnNextLogin(props.location);
        return <Redirect to="/login" />;
      }
    }}
  />
);

export default ProtectedRoute;

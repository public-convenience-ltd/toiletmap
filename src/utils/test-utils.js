import React from 'react';
import { render } from '@testing-library/react';

import AuthProvider from '../Auth';
import App from '../App';

const AllTheProviders = ({ children }) => (
  <AuthProvider>
    <App>{children}</App>
  </AuthProvider>
);

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };

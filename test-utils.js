import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import { MemoryRouter as Router } from 'react-router-dom';
import 'mutationobserver-shim';

import theme from './src/theme';

const AllTheProviders = ({ children }) => (
  <Router>
    <ThemeProvider theme={theme} children={children} />
  </Router>
);

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';

export { customRender as render };

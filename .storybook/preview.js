// Polyfills
import 'resize-observer-polyfill';

import providersDecorator from './providersDecorator';
import { MockedProvider } from '@apollo/client/testing';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  apolloClient: {
    MockedProvider,
    // any props you want to pass to MockedProvider on every story
  },
};

export const decorators = [providersDecorator];

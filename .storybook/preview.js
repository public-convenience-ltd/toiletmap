// Polyfills
import 'resize-observer-polyfill';

import providersDecorator from './providersDecorator';
import { MockedProvider } from '@apollo/client/testing';

// Import design system component styles for our Stories.
import '../src/design-system/components/Badge/Badge.css';
import '../src/design-system/components/Button/Button.css';
import '../src/design-system/components/InputField/InputField.css';
import '../src/design-system/components/RadioInput/RadioInput';

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

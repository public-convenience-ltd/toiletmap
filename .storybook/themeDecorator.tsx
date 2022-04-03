import React from 'react';
import { DecoratorFn } from '@storybook/react';
import App from '../src/pages/_app';

const providersDecorator: DecoratorFn = (StoryToDecorate, context) => (
  <App Component={StoryToDecorate} pageProps={context} />
);

export default providersDecorator;

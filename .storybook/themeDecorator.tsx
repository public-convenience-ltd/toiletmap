import React from 'react';
import { DecoratorFn } from '@storybook/react';
import Providers from '../src/components/Providers';

const providersDecorator: DecoratorFn = (StoryToDecorate, context) => (
  <Providers>
    <StoryToDecorate />
  </Providers>
);

export default providersDecorator;

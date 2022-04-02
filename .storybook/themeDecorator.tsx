import React from 'react';
import { DecoratorFn } from '@storybook/react';
import { ThemeProvider } from '@emotion/react';
import theme from '../src/theme';
import globalStyles from '../src/globalStyles';

const clientStateDecorator: DecoratorFn = (StoryToDecorate, context) => (
  <ThemeProvider theme={theme}>
    {globalStyles}
    <StoryToDecorate />
  </ThemeProvider>
);

export default clientStateDecorator;

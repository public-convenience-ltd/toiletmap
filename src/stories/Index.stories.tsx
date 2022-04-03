import { StoryContext } from '@storybook/react';
import React from 'react';

import IndexPage from '../pages/index';

export default {
  name: 'Index page',
  component: IndexPage,
} as StoryContext;

/**
 * Privacy page
 */
export const Index = (props) => {
  return <IndexPage {...props} />;
};

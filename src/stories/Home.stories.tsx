import { Meta } from '@storybook/react';
import React from 'react';

import HomePage from '../pages/index';

export default {
  name: 'Home page',
  component: HomePage,
} as Meta;

/**
 * Home page
 */
export const Home = (props) => {
  return <HomePage {...props} />;
};

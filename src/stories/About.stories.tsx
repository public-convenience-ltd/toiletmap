import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from '../pages/about';

export default {
  name: 'About page',
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = (props) => {
  return <AboutPage {...props} />;
};

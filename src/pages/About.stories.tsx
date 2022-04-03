import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from './about';

export default {
  name: 'Pages',
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = (props) => {
  return <AboutPage {...props} />;
};

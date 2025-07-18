import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from './about.page';
import SiteLayout from '../design-system/components/SiteLayout';

export default {
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = () => {
  return <SiteLayout Component={AboutPage} />;
};

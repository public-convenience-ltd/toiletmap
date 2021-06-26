import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from '../pages/about.page';
import Main from '../components/Main';

export default {
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = (props) => {
  return <Main Component={AboutPage} pageProps={props} />;
};

import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from './about';
import Main from '../components/Main';

export default {
  name: 'Pages',
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = (props) => {
  return <Main Component={AboutPage} pageProps={props} />;
};

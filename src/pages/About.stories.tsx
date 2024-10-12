import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from '../pages/about.page';
import Main from '../components/Main';
import { allPages } from 'content-collections';

export default {
  component: AboutPage,
} as Meta;

/**
 * About page
 */
export const About = (props) => {
  return (
    <Main
      Component={AboutPage}
      pageProps={{
        ...props,
        pageData: allPages.find((post) => post._meta.fileName === 'about.mdx'),
      }}
    />
  );
};

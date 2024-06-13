import { Meta } from '@storybook/react';
import React from 'react';

import AboutPage from '../pages/about.page';
import Main from '../components/Main';
import { allPages } from 'contentlayer/generated';

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
        pageData: allPages.find(
          (post) => post._raw.flattenedPath.split('pages/')[1] === 'about',
        ),
      }}
    />
  );
};

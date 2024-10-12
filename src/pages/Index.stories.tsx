import { Meta } from '@storybook/react';
import React from 'react';
import LooMap from '../components/LooMap/LooMapLoader';

import Main from '../components/Main';

import IndexPageNext from '../pages/index.page';
import { allPages } from 'content-collections';

export default {
  name: 'Pages',
  component: IndexPageNext,
} as Meta;

/**
 * Index
 */
export const Index = (props) => {
  return (
    <Main
      Component={IndexPageNext}
      pageProps={{
        ...props,
        pageData: allPages.find((post) => post._meta.fileName === 'index.mdx'),
      }}
      map={<LooMap />}
    />
  );
};
Index.storyName = 'Home Page';

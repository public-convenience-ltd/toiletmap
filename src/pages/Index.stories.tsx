import { Meta } from '@storybook/react';
import React from 'react';

import Main from '../components/Main';

import IndexPageNext from './index.page';

export default {
  name: 'Pages',
  component: IndexPageNext,
} as Meta;

/**
 * Index
 */
export const Index = (props) => {
  return <Main Component={IndexPageNext} pageProps={props} />;
};

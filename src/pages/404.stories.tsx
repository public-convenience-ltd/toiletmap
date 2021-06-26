import React from 'react';
import { Meta } from '@storybook/react';

import NotFoundPage from './404.page';
import Main from '../components/Main';

export default {
  name: 'Pages',
  component: NotFoundPage,
} as Meta;

export const NotFound = (props) => {
  return <Main Component={NotFoundPage} pageProps={props} />;
};
NotFound.storyName = '404';

import React from 'react';
import { Meta } from '@storybook/react';

import NotFoundPage from './404';

export default {
  name: 'Pages',
  component: NotFoundPage,
} as Meta;

export const NotFound = (props) => {
  return <NotFoundPage {...props} />;
};
NotFound.storyName = '404';

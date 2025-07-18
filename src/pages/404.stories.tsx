import React from 'react';
import { Meta } from '@storybook/react';

import NotFoundPage from './404.page';
import SiteLayout from '../design-system/components/SiteLayout';

export default {
  name: 'Pages',
  component: NotFoundPage,
} as Meta;

export const NotFound = () => {
  return <SiteLayout Component={NotFoundPage} />;
};
NotFound.storyName = '404';

import React from 'react';
import { Meta } from '@storybook/react';

import SiteLayout from '../design-system/components/SiteLayout';
import ThereWasAProblem from './500.page';

export default {
  name: 'Pages',
  component: ThereWasAProblem,
} as Meta;

export const NotFound = () => {
  return <SiteLayout Component={ThereWasAProblem} />;
};
NotFound.storyName = '500';

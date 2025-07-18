import { Meta } from '@storybook/react';
import React from 'react';
import LooMap from '../components/LooMap/LooMapLoader';

import SiteLayout from '../design-system/components/SiteLayout';

import IndexPageNext from './index.page';

export default {
  name: 'Pages',
  component: IndexPageNext,
} as Meta;

/**
 * Index
 */
export const Index = () => {
  return <SiteLayout Component={IndexPageNext} map={<LooMap />} />;
};

Index.storyName = 'Home Page';

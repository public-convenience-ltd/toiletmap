import { Meta } from '@storybook/react';
import React from 'react';

import SiteLayout from '../../design-system/components/SiteLayout';

import MapPageNext from './index.page';

export default {
  name: 'Pages',
  component: MapPageNext,
  parameters: {
    nextjs: {
      router: {
        path: '/map/[lng]/[lat]',
        asPath: '/map/0.1276/51.5072',
        query: {
          lng: '0.1276',
          lat: '51.5072',
        },
      },
    },
  },
} as Meta;

/**
 * Map Page
 */
export const Index = (props) => {
  return <SiteLayout Component={MapPageNext} pageProps={props} />;
};
Index.storyName = 'Map Page';

import { Meta } from '@storybook/react';
import React from 'react';

import SiteLayout from '../design-system/components/SiteLayout';

import DatasetPage from './dataset.page';

export default {
  name: 'Pages/Dataset',
  component: DatasetPage,
  args: {
    fileListing: [
      {
        downloadUrl:
          'https://p02w6qqjlqmja4sk.public.blob.vercel-storage.com/exports/toilets-2025-07-05T00%3A00%3A37.142Z-cRDGAjQnCNsGMWbJGEfByXbeQsVi7d.csv?download=1',
        pathname: 'exports/toilets-2025-07-05T00:00:37.142Z.csv',
        size: 7733561,
        type: 'csv',
        lastUpdated: '05/07/2025, 01:00',
      },
      {
        downloadUrl:
          'https://p02w6qqjlqmja4sk.public.blob.vercel-storage.com/exports/toilets-2025-07-05T00%3A00%3A37.142Z-hkcZL3tMnhWeSAwTi49azACjBlFdJ4.json?download=1',
        pathname: 'exports/toilets-2025-07-05T00:00:37.142Z.json',
        size: 10815489,
        type: 'json',
        lastUpdated: '05/07/2025, 01:00',
      },
    ],
  },
} as Meta;

/**
 * Dataset page
 */
export const Dataset = (props) => {
  return <SiteLayout Component={DatasetPage} pageProps={props} />;
};

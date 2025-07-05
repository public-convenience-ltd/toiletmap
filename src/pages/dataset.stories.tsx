import { Meta } from '@storybook/react';
import React from 'react';

import Main from '../components/Main';

import DatasetPage from './dataset.page';

export default {
  name: 'Pages/Dataset',
  component: DatasetPage,
} as Meta;

/**
 * Dataset page
 */
export const Dataset = (props) => {
  return <Main Component={DatasetPage} pageProps={props} />;
};

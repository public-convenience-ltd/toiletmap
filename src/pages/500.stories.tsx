import React from 'react';
import { Meta } from '@storybook/react';

import Main from '../components/Main';
import ThereWasAProblem from './500.page';

export default {
  name: 'Pages',
  component: ThereWasAProblem,
} as Meta;

export const NotFound = (props) => {
  return <Main Component={ThereWasAProblem} pageProps={props} />;
};
NotFound.storyName = '500';

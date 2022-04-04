import React from 'react';
import { Meta } from '@storybook/react';
import { PageFindLooByIdComp } from '../../api-client/page';
import { default as AddPageNext } from './add';
import Main from '../../components/Main';

export default {
  name: 'Pages',
  component: AddPageNext,
  args: {
    user: {
      email: 'hi@email.com',
    },
  },
} as Meta<PageFindLooByIdComp>;

/**
 * Add
 */
export const Add = (props) => {
  return <Main Component={AddPageNext} pageProps={props} />;
};

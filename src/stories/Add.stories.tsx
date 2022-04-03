import React from 'react';
import { Meta } from '@storybook/react';
import { PageFindLooByIdComp } from '../api-client/page';
import { default as AddPageNext } from '../pages/loos/add';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  name: 'Add',
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
  return <AddPageNext {...props} />;
};

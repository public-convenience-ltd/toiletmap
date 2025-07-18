import React from 'react';
import { Meta } from '@storybook/react';
import { PageFindLooByIdComp } from '../../api-client/page';
import { default as AddPageNext } from './add.page';
import SiteLayout from '../../design-system/components/SiteLayout';

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
export const Add = () => {
  return <SiteLayout Component={AddPageNext} />;
};

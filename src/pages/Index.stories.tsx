import { Meta } from '@storybook/react';
import React from 'react';

import IndexPageNext from '../pages/index';

export default {
  name: 'Pages',
  component: IndexPageNext,
} as Meta;

/**
 * Index
 */
export const Index = (props) => {
  return <IndexPageNext {...props} />;
};

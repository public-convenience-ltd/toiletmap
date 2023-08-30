import { Meta } from '@storybook/react';

import Icon from './Icon';

export default {
  title: 'Design-System/Icon',
  component: Icon,
  args: {
    icon: 'list',
    spin: false,
    size: 'medium',
  },
} as Meta;

export const Default = (args) => <Icon {...args} />;

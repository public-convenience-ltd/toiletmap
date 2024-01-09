import { Meta, StoryObj } from '@storybook/react';

import Badge from './Badge';

export default {
  title: 'Design-System/Badge',
  component: Badge,
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj<typeof Badge> = {
  render: () => {
    return <Badge>Badge</Badge>;
  },
};

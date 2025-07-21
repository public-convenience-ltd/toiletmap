import { Meta, StoryObj } from '@storybook/react';

import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design-System/Components/Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Badge> = {
  render: () => {
    return <Badge>Badge</Badge>;
  },
};

import { Meta, StoryObj } from '@storybook/react';

import Stack from './Stack';
import Badge from '../../components/Badge';

const meta: Meta<typeof Stack> = {
  title: 'Design-System/Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Stack> = {
  render: () => {
    return (
      <Stack>
        <Badge>Badge</Badge>
        <Badge>Badge</Badge>
        <Badge>Badge</Badge>
      </Stack>
    );
  },
};

import { Meta, StoryObj } from '@storybook/react';

import Logo from './Logo';

const meta: Meta<typeof Logo> = {
  title: 'Design-System/Components/Logo',
  component: Logo,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Logo> = {
  render: () => {
    return <Logo />;
  },
};

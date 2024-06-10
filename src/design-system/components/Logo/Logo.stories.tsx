import { Meta, StoryObj } from '@storybook/react';

import Logo from './Logo';

export default {
  title: 'Design-System/Logo',
  component: Logo,
  tags: ['autodocs'],
} as Meta;

export const Default: StoryObj<typeof Logo> = {
  render: () => {
    return <Logo />;
  },
};

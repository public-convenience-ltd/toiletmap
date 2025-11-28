import { Meta, StoryObj } from '@storybook/react';
import Banner from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Design System/Components/Banner',
  component: Banner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['success', 'error', 'warning', 'info'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Banner>;

export const Default: Story = {
  args: {
    title: 'Info',
    variant: 'info',
    children: 'This is a default info banner.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'The action was completed successfully.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Something went wrong. Please try again.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'This is a warning message.',
  },
};

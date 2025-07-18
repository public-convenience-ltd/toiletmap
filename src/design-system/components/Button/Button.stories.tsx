import { Meta, StoryObj } from '@storybook/react';

import Button from './Button';
import Icon from '../Icon/Icon';

const meta: Meta<typeof Button> = {
  title: 'Design-System/Components/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    variant: 'primary',
    htmlElement: 'button',
  },
  argTypes: {
    variant: {
      options: ['primary', 'secondary'],
      control: { type: 'radio' },
    },
    htmlElement: {
      options: ['button', 'a'],
      control: { type: 'radio' },
    },
    href: {
      control: 'text',
      description: 'Only required when using the button as a link',
    },
  },
};

export default meta;

export const Primary: StoryObj<typeof Button> = {
  render: (args) => {
    return <Button {...args}>Primary</Button>;
  },
};

export const Secondary: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Button variant="secondary" htmlElement="button">
        Secondary
      </Button>
    );
  },
};

export const WithIcon: StoryObj<typeof Button> = {
  render: () => {
    return (
      <Button variant="secondary" htmlElement="button">
        <Icon icon="xmark" size="small" />
      </Button>
    );
  },
};

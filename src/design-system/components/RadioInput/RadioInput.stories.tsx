import { Meta } from '@storybook/react';

import Radio from './RadioInput';

export default {
  title: 'Design-System/Form Elements/Radio Input',

  tags: ['autodocs'],
  args: {
    defaultChecked: false,
  },
  argTypes: {
    defaultChecked: {
      control: 'boolean',
    },
  },
  parameters: {
    iframeHeight: 200,
  },
} as Meta;

export const Default = (args) => {
  console.log({ ...args });
  return <Radio {...args} />;
};

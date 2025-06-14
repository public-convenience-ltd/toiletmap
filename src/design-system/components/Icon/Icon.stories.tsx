import { Meta } from '@storybook/react';

import Icon from './Icon';

const meta: Meta<typeof Icon> = {
  title: 'Design-System/Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  args: {
    icon: 'list',
    spin: false,
    size: 'medium',
  },
};

export default meta;

export const Default = (args) => <Icon {...args} />;

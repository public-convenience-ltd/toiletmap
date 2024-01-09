import { Meta, StoryObj } from '@storybook/react';

import Switch from './Switch';
import { useState } from 'react';

const meta: Meta<typeof Switch> = {
  title: 'Design-System/Form Elements/Switch',
  component: Switch,
  tags: ['autodocs'],
};

export default meta;

const SwitchWithState = () => {
  const [checked, setChecked] = useState(false);
  return <Switch onChange={setChecked} checked={checked} />;
};

export const Primary: StoryObj<typeof Switch> = {
  render: () => <SwitchWithState />,
};

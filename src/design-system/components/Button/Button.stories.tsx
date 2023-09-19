import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from './Button';
import Icon from '../Icon/Icon';

export default {
  title: 'Design-System/Button',
  component: Button,
  argTypes: {
    children: { table: { disable: true } },
    variant: { table: { disable: true } },
  },
  args: { href: 'www.google.com' },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => <Button {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  children: <span>Primary button</span>,
  variant: 'primary',
  htmlElement: 'button',
};

export const Secondary = Template.bind({});

Secondary.args = {
  children: 'Secondary button',
  variant: 'secondary',
  htmlElement: 'button',
};

export const WithIcon = Template.bind({});

WithIcon.args = {
  children: <Icon icon="xmark" size="small" />,
  variant: 'secondary',
  htmlElement: 'button',
};

import { ComponentStory, ComponentMeta } from '@storybook/react';

import Badge from './Badge';

export default {
  title: 'Design-System/Badge',
  component: Badge,
} as ComponentMeta<typeof Badge>;

const Template: ComponentStory<typeof Badge> = (args) => <Badge {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  children: 'Primary badge',
};

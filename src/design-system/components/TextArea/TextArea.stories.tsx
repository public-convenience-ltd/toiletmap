import { Meta, StoryObj } from '@storybook/react';

import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Design-System/Form Elements/TextArea',
  component: TextArea,
};

export default meta;

export const Primary: StoryObj<typeof TextArea> = {
  render: () => <TextArea />,
};

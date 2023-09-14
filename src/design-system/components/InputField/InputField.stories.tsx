import { Meta } from '@storybook/react';

import InputField from './InputField';
import React from 'react';

export default {
  title: 'Design-System/Form Elements/Input Field',
  component: InputField,
  args: {
    placeholder: 'Enter a location e.g. London',
  },
  parameters: {
    iframeHeight: 200,
    docs: {
      description: {
        component:
          'This component accepts data from the user and has the props associated with an input field',
      },
      iframeHeight: 200,
    },
  },
} as Meta;

export const Default = (args) => <InputField {...args} />;

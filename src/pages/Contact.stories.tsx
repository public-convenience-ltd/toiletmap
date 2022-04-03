import { Meta } from '@storybook/react';
import React from 'react';

import ContactPage from './contact';

export default {
  name: 'Pages',
  component: ContactPage,
} as Meta;
// This is the only named export in the file, and it matches the component name
export const Contact = (args) => <ContactPage {...args} />;

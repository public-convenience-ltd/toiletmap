import { Meta } from '@storybook/react';
import React from 'react';
import SiteLayout from '../design-system/components/SiteLayout';

import ContactPage from './contact.page';

export default {
  name: 'Happy',
  component: ContactPage,
} as Meta;
// This is the only named export in the file, and it matches the component name
export const Contact = () => <SiteLayout Component={ContactPage} />;

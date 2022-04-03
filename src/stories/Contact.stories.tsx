import { Meta } from '@storybook/react';
import React from 'react';

import ContactPage from '../pages/contact';

export default {
  name: 'Contact page',
  component: ContactPage,
} as Meta;

/**
 * Contact page
 */
export const Contact = (props) => {
  return <ContactPage {...props} />;
};

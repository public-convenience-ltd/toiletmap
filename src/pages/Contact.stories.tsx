import { Meta } from '@storybook/react';
import React from 'react';
import Main from '../components/Main';

import ContactPage from './contact.page';

export default {
  name: 'Happy',
  component: ContactPage,
} as Meta;
// This is the only named export in the file, and it matches the component name
export const Contact = (props) => (
  <Main Component={ContactPage} pageProps={props} />
);

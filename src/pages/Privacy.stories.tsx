import { Meta } from '@storybook/react';
import React from 'react';

import Main from '../components/Main';

import PrivacyPage from './privacy.page';

export default {
  name: 'Pages/Privacy',
  component: PrivacyPage,
} as Meta;

/**
 * Privacy page
 */
export const Privacy = (props) => {
  return <Main Component={PrivacyPage} pageProps={props} />;
};

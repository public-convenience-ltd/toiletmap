import { Meta } from '@storybook/react';
import React from 'react';

import SiteLayout from '../design-system/components/SiteLayout';

import PrivacyPage from './privacy.page';

export default {
  name: 'Pages/Privacy',
  component: PrivacyPage,
} as Meta;

/**
 * Privacy page
 */
export const Privacy = () => {
  return <SiteLayout Component={PrivacyPage} />;
};

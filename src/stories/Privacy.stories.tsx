import { Meta } from '@storybook/react';
import React from 'react';

import PrivacyPage from '../pages/privacy';

export default {
  name: 'Privacy page',
  component: PrivacyPage,
} as Meta;

/**
 * Privacy page
 */
export const Privacy = (props) => {
  return <PrivacyPage {...props} />;
};

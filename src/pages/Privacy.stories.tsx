import { Meta } from '@storybook/react';
import React from 'react';

import PrivacyPage from './privacy';

export default {
  name: 'Privacy',
  component: PrivacyPage,
} as Meta;

/**
 * Privacy page
 */
export const Privacy = (props) => {
  return <PrivacyPage {...props} />;
};

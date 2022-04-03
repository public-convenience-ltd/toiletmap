import { StoryContext } from '@storybook/react';
import React from 'react';

import PrivacyPage from '../pages/privacy';

export default {
  name: 'Privacy page',
  component: PrivacyPage,
} as StoryContext;

/**
 * Privacy page
 */
export const Privacy = (props) => {
  return <PrivacyPage {...props} />;
};

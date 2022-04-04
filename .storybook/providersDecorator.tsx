import React from 'react';
import { DecoratorFn } from '@storybook/react';
import Providers from '../src/components/Providers';
import { UserProvider } from '@auth0/nextjs-auth0';

const providersDecorator: DecoratorFn = (StoryToDecorate, context) => {
  return (
    <Providers>
      <UserProvider user={context.args?.user}>
        <StoryToDecorate {...context} />
      </UserProvider>
    </Providers>
  );
};

export default providersDecorator;

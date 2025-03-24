import React from 'react';
import Providers from '../src/components/Providers';
import { Auth0Provider } from '@auth0/nextjs-auth0';

const providersDecorator = (StoryToDecorate, context) => {
  return (
    <Providers>
      <Auth0Provider user={context.args?.user}>
        <StoryToDecorate {...context} />
      </Auth0Provider>
    </Providers>
  );
};

export default providersDecorator;

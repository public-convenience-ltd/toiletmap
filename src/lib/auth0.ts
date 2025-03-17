import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.APP_BASE_URL,
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid profile email',
  },
});

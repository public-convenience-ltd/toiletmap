import { Auth0Client } from '@auth0/nextjs-auth0/server';

type RequiredEnvVar =
  | 'AUTH0_CLIENT_ID'
  | 'AUTH0_CLIENT_SECRET'
  | 'AUTH0_DOMAIN'
  | 'AUTH0_SECRET';

const getEnvVar = (key: RequiredEnvVar) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key} environment variable required for Auth0 configuration`,
    );
  }
  return value;
};

const appBaseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';

const authorizationParameters =
  process.env.AUTH0_AUDIENCE && process.env.AUTH0_AUDIENCE.length > 0
    ? {
        scope: 'openid profile email',
        audience: process.env.AUTH0_AUDIENCE,
      }
    : { scope: 'openid profile email' };

const domain = getEnvVar('AUTH0_DOMAIN');
const clientId = getEnvVar('AUTH0_CLIENT_ID');
const clientSecret = getEnvVar('AUTH0_CLIENT_SECRET');
const secret = getEnvVar('AUTH0_SECRET');

export const auth0 = new Auth0Client({
  domain,
  clientId,
  clientSecret,
  secret,
  appBaseUrl,
  authorizationParameters,
});

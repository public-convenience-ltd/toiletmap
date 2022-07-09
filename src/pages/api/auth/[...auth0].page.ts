import { handleAuth } from '@auth0/nextjs-auth0';
import { withSentry } from '@sentry/nextjs';

export default process.env.VERCEL_ENV === 'production'
  ? withSentry(handleAuth())
  : handleAuth();

import { handleAuth } from '@auth0/nextjs-auth0';
import { withSentry } from '@sentry/nextjs';

export default withSentry(handleAuth());

import { getSession } from '@auth0/nextjs-auth0';
import { withSentry } from '@sentry/nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import { alertMessages } from '../../../../config';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, message } = req.query;

  const isMessageValid =
    Object.keys(alertMessages).indexOf(message as string) > -1;

  const finalMessage = isMessageValid ? message : '';

  try {
    // Check that the user has a valid session before allowing revalidation.
    // We might have a session on toiletmap.org.uk.
    const { user } = getSession(req, res);
    if (user) {
      await res.revalidate(`/loos/${id}`);
    }

    return res.redirect(`/loos/${id}?message=${finalMessage}`);
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.redirect(`/loos/${id}?message=generic_error`);
  }
}

export default process.env.IS_E2E != 'true' &&
process.env.VERCEL_ENV === 'production'
  ? withSentry(handler)
  : handler;

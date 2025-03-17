import { NextApiRequest, NextApiResponse } from 'next';
import { alertMessages } from '../../../../config';
import { auth0 } from '../../../../lib/auth0';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, message } = req.query;

  const isMessageValid =
    Object.keys(alertMessages).indexOf(message as string) > -1;

  const finalMessage = isMessageValid ? message : '';

  try {
    // Check that the user has a valid session before allowing revalidation.
    // We might have a session on toiletmap.org.uk.
    const { user } = await auth0.getSession(req);
    if (user) {
      await res.revalidate(`/loos/${id}`);
    }

    return res.redirect(`/loos/${id}?message=${finalMessage}`);
  } catch {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.redirect(`/loos/${id}?message=generic_error`);
  }
}

export default handler;

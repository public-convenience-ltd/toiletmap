import { NextApiRequest, NextApiResponse } from 'next';
import { auth0 } from '../../../../lib/auth0';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // Check that the user has a valid session before allowing revalidation.
    // We might have a session on toiletmap.org.uk.
    const { user } = await auth0.getSession(req);
    if (user) {
      await res.revalidate(`/loos/${id}`);
      await res.revalidate(`/explorer/loos/${id}`);
    }

    return res.json({ ok: true });
  } catch {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.json({ ok: false });
  }
}

export default handler;

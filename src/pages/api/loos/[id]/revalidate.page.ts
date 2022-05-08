import { getSession } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  try {
    // Check that the user has a valid session before allowing revalidation.
    // We might have a session on toiletmap.org.uk.
    const { user } = getSession(req, res);
    if (user) {
      await res.unstable_revalidate(`/loos/${id}`);
      return res.redirect(`/loos/${id}?message=updated`);
    }
    return res.redirect(`/loos/${id}?message=auth_needed`);
  } catch (err) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.redirect(`/loos/${id}?message=generic_error`);
  }
}

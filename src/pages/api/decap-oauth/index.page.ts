import { authUrl } from '../../../lib/decapOauthConfig';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
  res.redirect(authUrl);
}

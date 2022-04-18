import { initAuth0 } from '@auth0/nextjs-auth0';
import { IncomingMessage } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';

const initializeAuth0 = (
  req: NextApiRequest | IncomingMessage
): ReturnType<typeof initAuth0> => {
  return initAuth0({
    baseURL:
      req.headers.origin ||
      `${process.env.NODE_ENV === 'development' ? 'http' : 'https'}://${
        req.headers.host
      }`,
  });
};

export default function auth(
  req: NextApiRequest,
  res: NextApiResponse
): void | Promise<void> {
  const auth0 = initializeAuth0(req);
  return auth0.handleAuth()(req, res);
}

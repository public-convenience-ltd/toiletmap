import { NextApiRequest, NextApiResponse } from 'next';
import {
  clientId,
  clientSecret,
  tokenUrl,
} from '../../../lib/decapOauthConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const data = {
    code: req.query?.code as string,
    client_id: clientId,
    client_secret: clientSecret,
  };

  try {
    const accessTokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!accessTokenResponse.ok) {
      throw new Error(
        `Failed to fetch access token: ${accessTokenResponse.statusText}`,
      );
    }

    const body = await accessTokenResponse.json();

    const authContent = {
      token: body.access_token,
      provider: 'github',
    };

    const script = `
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:${authContent.provider}:success:${JSON.stringify(authContent)}',
            message.origin
          );

          window.removeEventListener("message", receiveMessage, false);
        }
        window.addEventListener("message", receiveMessage, false);

        window.opener.postMessage("authorizing:${authContent.provider}", "*");
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(script);
  } catch (err) {
    console.error(err);
    return res.redirect('/?error=decap_oauth_error');
  }
}

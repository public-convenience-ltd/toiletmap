import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/html');
  return res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex" />
        <link href="/admin/config.yml" type="text/yaml" rel="cms-config-url" />
        <title>Content Manager</title>
      </head>
      <body>
        <!-- Include the script that builds the page and powers Decap CMS -->
        <script src="https://unpkg.com/decap-cms@^3.1.10/dist/decap-cms.js"></script>
      </body>
    </html>
  `);
}

export default handler;

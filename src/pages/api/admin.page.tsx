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
        <script src="https://cdn.jsdelivr.net/npm/decap-cms@3.4.0/dist/decap-cms.min.js"></script>
      </body>
    </html>
  `);
}

export default handler;

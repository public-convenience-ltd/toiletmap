import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feedback = req.body;
  fetch(process.env.SLACK_FEEDBACK_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: feedback?.text }),
  });
  res.send(200);
}

export default handler;

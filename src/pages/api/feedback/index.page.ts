import { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const feedback = req.body;
  try {
    await fetch(process.env.SLACK_FEEDBACK_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: feedback?.text }),
    });
    res.send(200);
  } catch (error) {
    console.error('There was an error sending the feedback to Slack', error);
    res.send(500);
  }
}

export default handler;

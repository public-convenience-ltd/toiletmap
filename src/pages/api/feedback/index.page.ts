import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../api/prisma/prisma';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text, email, route } = req.body;

  if (typeof text !== 'string' || text.length === 0) {
    return res.status(400).send('Feedback text is required');
  }

  try {
    // We'd like to record the full feedback entry in our database for future reference.
    await prisma.feedback.create({
      data: {
        email,
        feedback_text: text,
        route,
      },
    });

    if (!URL.canParse(process.env.SLACK_FEEDBACK_WEBHOOK)) {
      console.warn('Slack feedback webhook not set, skipping send to channel');
      return res.send(200);
    }

    try {
      // We only pass on the feedback content and website path to Slack, not the users' email if they provided one.
      await fetch(process.env.SLACK_FEEDBACK_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `${text}\r\n------\r\nRoute: ${route}`,
        }),
      });
    } catch (e) {
      console.error(
        'Problem sending feedback to Slack, but feedback was persisted successfully',
        e,
      );
      return res.send(200);
    }

    return res.send(200);
  } catch (error) {
    console.error('There was an error processing the feedback', error);
    return res.send(500);
  }
}

export default handler;

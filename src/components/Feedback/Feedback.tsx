import React from 'react';
import { Fade, Stack, Textarea } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import Button from '../Button';
import Notification from '../Notification';

enum FeedbackState {
  SUCCESS = 0,
  FAILURE = 1,
  PENDING = 2,
}

const Feedback = () => {
  const [submitState, setSubmitState] = useState(FeedbackState.PENDING);

  const textArea = useRef<HTMLTextAreaElement>();
  const submitFeedback = () => {
    setSubmitState(FeedbackState.PENDING);

    // Only attempt submit if the user has typed something in the text area
    const hasUserInputText = textArea.current?.value.length > 0;

    if (hasUserInputText) {
      const input = textArea.current.value;
      const payload = {
        text: input,
      };

      try {
        fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        // eslint-disable-next-line functional/immutable-data
        textArea.current.value = '';

        setSubmitState(FeedbackState.SUCCESS);
      } catch (e) {
        setSubmitState(FeedbackState.FAILURE);
      }
    }
  };

  return (
    <>
      <Stack spacing="2" width={['100%', 'auto']}>
        <Fade unmountOnExit in={submitState === FeedbackState.FAILURE}>
          <Notification>There was a problem, please try again!</Notification>
        </Fade>
        <Fade unmountOnExit in={submitState === FeedbackState.SUCCESS}>
          <Notification>Thank you!</Notification>
        </Fade>

        <Textarea
          ref={textArea}
          _placeholder={{ fontWeight: 'thin', fontStyle: 'italic' }}
          resize={'none'}
          height="16rem"
          placeholder={`The Toilet Map is a free and open source project that we maintain in our spare time.

We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
        />
        <Button onClick={submitFeedback}>Submit</Button>
      </Stack>
    </>
  );
};

export default Feedback;

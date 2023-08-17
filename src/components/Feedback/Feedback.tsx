import { Stack } from '@mui/material';
import React, { useRef, useState } from 'react';
import Button from '../../design-system/components/Button';
import Box from '../Box';
import Badge from '../../design-system/components/Badge';

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
    <Stack spacing="1rem" padding="0.5rem" width="fit-content">
      {submitState === FeedbackState.SUCCESS && <Badge>Thank you!</Badge>}

      <Box
        as="textarea"
        ref={textArea}
        //_placeholder={{ fontWeight: 'thin', fontStyle: 'italic' }}
        resize={'none'}
        height="16rem"
        width="20rem"
        placeholder={`The Toilet Map is a free and open source project that we maintain in our spare time.

We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
      />
      <Button
        htmlElement="button"
        variant="primary"
        type="submit"
        onClick={submitFeedback}
      >
        Submit
      </Button>
    </Stack>
  );
};

export default Feedback;

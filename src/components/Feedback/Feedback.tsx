import { Stack } from '@mui/material';
import React, { useRef, useState } from 'react';
import Badge from '../../design-system/components/Badge';
import Button from '../../design-system/components/Button';
import Box from '../Box';
import InputField from '../../design-system/components/InputField';

enum FeedbackState {
  SUCCESS = 0,
  FAILURE = 1,
  PENDING = 2,
}

const Feedback = () => {
  const [submitState, setSubmitState] = useState(FeedbackState.PENDING);

  const feedbackTextArea = useRef<HTMLTextAreaElement>();
  const nameInput = useRef<HTMLInputElement>();
  const emailInput = useRef<HTMLInputElement>();

  const submitFeedback = async () => {
    setSubmitState(FeedbackState.PENDING);

    // Only attempt submit if the user has typed something in the text area
    const hasUserInputText = feedbackTextArea.current?.value.length > 0;

    if (hasUserInputText) {
      const input = `
Feedback :love_letter: : ${feedbackTextArea.current.value}
Name: ${nameInput.current.value ?? 'Not provided'}
Email: ${emailInput.current.value ?? 'Not provided'}
      `;
      const payload = {
        text: input,
      };

      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        // eslint-disable-next-line functional/immutable-data
        feedbackTextArea.current.value = '';
        // eslint-disable-next-line functional/immutable-data
        nameInput.current.value = '';
        // eslint-disable-next-line functional/immutable-data
        emailInput.current.value = '';

        setSubmitState(FeedbackState.SUCCESS);
      } catch (e) {
        setSubmitState(FeedbackState.FAILURE);
      }
    }
  };

  return (
    <Stack spacing="1rem" padding="0.5rem" width="fit-content">
      <label htmlFor="nameInput">Name (optional)</label>
      <InputField id="nameInput" ref={nameInput} type="text" />

      <label htmlFor="emailInput">Email (optional)</label>
      <InputField id="emailInput" ref={emailInput} type="email" />

      <label htmlFor="feedbackTextArea">Feedback</label>
      <Box
        as="textarea"
        id="feedbackTextArea"
        ref={feedbackTextArea}
        resize={'none'}
        height="16rem"
        width={['15rem', '20rem']}
        placeholder={`The Toilet Map is a free and open source project that we maintain in our spare time.

We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
        aria-description={`The Toilet Map is a free and open source project that we maintain in our spare time.

  We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
      ></Box>

      {submitState === FeedbackState.SUCCESS && <Badge>Thank you!</Badge>}
      <Button
        htmlElement="button"
        variant="primary"
        type="submit"
        aria-label="Submit Feedback"
        onClick={submitFeedback}
      >
        Submit
      </Button>
    </Stack>
  );
};

export default Feedback;

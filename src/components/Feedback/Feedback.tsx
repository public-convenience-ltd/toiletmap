import { Stack } from '@mui/material';
import React, { useRef, useState } from 'react';
import Badge from '../../design-system/components/Badge';
import Button from '../../design-system/components/Button';
import InputField from '../../design-system/components/InputField';
import Link from 'next/link';
import TextArea from '../../design-system/components/TextArea';

enum FeedbackState {
  SUCCESS = 0,
  FAILURE = 1,
  PENDING = 2,
}

const Feedback = () => {
  const [submitState, setSubmitState] = useState(FeedbackState.PENDING);

  const feedbackTextArea = useRef<HTMLTextAreaElement>();
  const emailInput = useRef<HTMLInputElement>();

  const submitFeedback = async () => {
    setSubmitState(FeedbackState.PENDING);

    // Only attempt submit if the user has typed something in the text area
    const hasUserInputText = feedbackTextArea.current?.value.length > 0;

    if (hasUserInputText) {
      const input = feedbackTextArea.current.value;
      const payload = {
        text: input,
        email: emailInput.current.value,
        route: window.location.pathname,
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
        emailInput.current.value = '';

        setSubmitState(FeedbackState.SUCCESS);
      } catch (e) {
        setSubmitState(FeedbackState.FAILURE);
      }
    }
  };

  return (
    <Stack spacing="1rem" padding="0.5rem" width="fit-content">
      {submitState === FeedbackState.SUCCESS && <Badge>Thank you!</Badge>}

      <label htmlFor="emailInput" style={{ fontWeight: 'bold' }}>
        Email (optional)
      </label>
      <InputField
        id="emailInput"
        ref={emailInput}
        type="email"
        maxLength={255}
      />

      <label htmlFor="feedbackTextArea" style={{ fontWeight: 'bold' }}>
        Feedback
      </label>
      <TextArea
        ref={feedbackTextArea}
        id="feedbackTextArea"
        maxLength={5000}
        style={{
          resize: 'none',
          height: '16rem',
          width: '15rem',
        }}
        placeholder={`The Toilet Map is a free and open source project that we maintain in our spare time.

We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
        aria-details={`The Toilet Map is a free and open source project that we maintain in our spare time.

  We'd be so grateful if you could take a moment to give us feedback on how we could make your experience even better.`}
      ></TextArea>

      <Link
        target="_blank"
        href="/privacy"
        style={{ fontSize: 'var(--text--1)' }}
      >
        Privacy Policy
      </Link>

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

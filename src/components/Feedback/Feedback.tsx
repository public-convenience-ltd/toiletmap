import { Button, Heading, Stack, Textarea } from '@chakra-ui/react';
import { useRef } from 'react';

const Feedback = () => {
  const textArea = useRef<HTMLTextAreaElement>();

  return (
    <Stack spacing="2">
      <Heading size="md">Tell us about your experience</Heading>
      <Textarea ref={textArea} />
      <Button
        onClick={() => {
          const input = textArea.current.value;
          const payload = {
            text: input,
          };

          fetch('/api/feedback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
        }}
      >
        Submit
      </Button>
    </Stack>
  );
};

export default Feedback;

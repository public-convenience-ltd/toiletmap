import React from 'react';
import Box from '../components/Box';
import Spacer from '../components/Spacer';
import Text from '../components/Text';
import Button from '../components/Button';

const ThereWasAProblem = ({ children }) => (
  <>
    {children}
    <Box my={5}>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        width="100%"
        p={3}
      >
        <div>
          <Text fontSize={20} fontWeight="bold">
            <h1>Oh dear — There seems to have been a problem on our end</h1>
          </Text>

          <Spacer mt={3} />

          <p>
            Please try again later or, if the problem persists, please contact
            us at{' '}
            <Button
              variant="link"
              as="a"
              href="mailto:gbtoiletmap@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              gbtoiletmap@gmail.com
            </Button>
            .
          </p>

          <Spacer mt={4} />

          <Button as={'a'} variant="link" href="/">
            Take me back home!
          </Button>
        </div>
      </Box>
    </Box>
  </>
);

export default ThereWasAProblem;

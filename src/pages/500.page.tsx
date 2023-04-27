import React from 'react';
import Link from 'next/link';

import Box from '../components/Box';
import Spacer from '../components/Spacer';
import Text from '../components/Text';

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
            <Link href="mailto:gbtoiletmap@gmail.com">
              gbtoiletmap@gmail.com
            </Link>
            .
          </p>

          <Spacer mt={4} />

          <Link href="/">Take me back home!</Link>
        </div>
      </Box>
    </Box>
  </>
);

export default ThereWasAProblem;

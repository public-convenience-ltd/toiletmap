import React from 'react';
import { Link } from 'react-router-dom';

import PageLayout from '../components/PageLayout';
import Box from '../components/Box';
import Spacer from '../components/Spacer';
import Text from '../components/Text';
import Button from '../components/Button';

const NotFound = () => (
  <PageLayout>
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
        <Spacer mt={4} />

        <Text fontSize={20} fontWeight="bold">
          <h1>Page not found</h1>
        </Text>

        <Spacer mt={3} />

        <p>
          This could be because the page has moved, or you typed an address
          wrong.
        </p>

        <Spacer mt={4} />

        <Button as={Link} to="/">
          Take me back home!
        </Button>
      </div>
    </Box>
  </PageLayout>
);

export default NotFound;

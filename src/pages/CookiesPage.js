import React from 'react';

import PageLayout from '../components/PageLayout';
import Container from '../components/Container';
import Box from '../components/Box';

const CookiesPage = () => (
  <PageLayout>
    <Container maxWidth={845}>
      <Box py={4}>
        <h2>Cookies</h2>

        <p>
          Opting in to Google Analytics will help us improve your experience
          with the site. By opting in you would be sharing your data with Public
          Convenience Ltd, tech partners Neontribe and Google itself.
        </p>
        <p>
          Opting in to Adobe Analytics means we can share your data with
          Unilever and benefit from Unilever's continued sponsorship.
        </p>
        <p>
          For more detailed information about the cookies we use, see our
          privacy policy.
        </p>
      </Box>
    </Container>
  </PageLayout>
);

export default CookiesPage;

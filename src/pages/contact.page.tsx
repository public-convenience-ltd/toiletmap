import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';

import Container from '../components/Container';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import Box from '../components/Box';
import config from '../config';

const ContactPage = () => {
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('Contact Us')}</title>
      </Head>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>Contact Us</h1>
        </Text>
        <Spacer mb={5} />
        <p>
          If you have any problems updating the toilets, or wish to send us
          toilet details or comments, please contact{' '}
          <Link href="mailto:gbtoiletmap@gmail.com">gbtoiletmap@gmail.com</Link>
          .
        </p>
      </Container>
    </Box>
  );
};

export default ContactPage as NextPage;

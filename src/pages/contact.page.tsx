import Head from 'next/head';
import Container from '../components/Container';
import Button from '../components/Button';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import Box from '../components/Box';
import config from '../config';
import { NextPage } from 'next';

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
      </Container>
    </Box>
  );
};

export default ContactPage as NextPage;

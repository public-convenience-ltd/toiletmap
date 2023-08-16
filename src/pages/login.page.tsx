import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Link from 'next/link';

import Container from '../components/Container';
import Button from '../design-system/components/Button';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import Box, { BoxProps } from '../components/Box';

import config from '../config';

const List = styled.ul`
  list-style: initial;
`;

const ListItem = (props: BoxProps) => (
  <Box as="li" marginTop={2} marginLeft={4} {...props} />
);

const LoginPage = () => {
  const router = useRouter();
  return (
    <Box mt={5}>
      <Head>
        <title>{config.getTitle('Contributing')}</title>
      </Head>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>Want to Contribute Toilet Data?</h1>
        </Text>
        <Spacer mb={5} />
        <p>
          A publicly-accessible toilet means any toilet that the public are
          allowed to access without needing to be a customer.
        </p>
        <p>
          To add or edit a public toilet you will first need to Log in or Sign
          Up:
        </p>
        <Spacer mb={3} />

        <Button
          htmlElement="a"
          variant="primary"
          href={`/api/auth/login?returnTo=${router.asPath}`}
        >
          Log In/Sign Up
        </Button>
        <Spacer mb={4} />
        <Text fontSize={3} fontWeight="bold">
          <h2>Examples of Public toilets</h2>
        </Text>
        <Spacer mb={3} />
        <List>
          <ListItem>
            Council-run toilets and other public toilet blocks
          </ListItem>
          <ListItem>
            Toilets in train stations, bus stations, service/petrol stations,
            tube stations, ferry terminals, airports and other transport
            networks
          </ListItem>
          <ListItem>Shopping centre toilets</ListItem>
          <ListItem>Other publicly-accessible toilets</ListItem>
          <ListItem>
            Toilets in public buildings, such as town halls, libraries,
            hospitals, museums and leisure centres
          </ListItem>
          <ListItem>
            Toilets in other businesses where the business agrees that the
            public can use their toilets without having to buy anything. These
            are often part of Community Toilet Schemes (run by councils) and can
            include shops, cafes, supermarkets, restaurants, hotels and pubs
          </ListItem>
          <ListItem>
            We try not to show toilets where you need to ask permission to use
            it, such as those that are for customers-only. The exception is
            platform-side toilets at stations. These are only accessible to
            ticket-holders but we feel it is useful information to include.
          </ListItem>
        </List>
        <Spacer mb={3} />

        <p>
          Anyone can go on the website and add, edit or remove toilets. We also
          use open data including from the OpenStreetMap project and request
          information from councils, private companies and organisations.
        </p>
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

export default LoginPage;

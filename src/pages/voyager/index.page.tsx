import Head from 'next/head';
import Box from '../../components/Box';
import Container from '../../components/Container';
import config from '../../config';
import { Text } from '@chakra-ui/react';

// const VoyagerComponent = dynamic(
//   () => import('graphql-voyager').then((mod) => mod.Voyager),
//   { ssr: false }
// );

// function introspectionProvider(query) {
//   return fetch('/api', {
//     method: 'post',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ query: query }),
//   }).then((response) => response.json());
// }

const Voyager = () => (
  <Box my={5}>
    <Head>
      <title>{config.getTitle('Schema Visualisation')}</title>
    </Head>

    <Container>
      <Text>
        Schema visualisation with Voyager has been disabled for now due to the
        package being out of date.
      </Text>
    </Container>
  </Box>
);

export default Voyager;

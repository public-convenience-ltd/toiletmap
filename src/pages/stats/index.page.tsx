import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Box from '../../components/Box';
import Container from '../../components/Container';
import Spacer from '../../components/Spacer';
import Text from '../../components/Text';
import config from '../../config';
import { withApollo } from '../../api-client/withApollo';
import { ssrStatistics } from '../../api-client/page';
import { StatisticsQuery } from '../../api-client/graphql';
import theme from '../../theme';

const Stats = ({ data: { statistics } }: { data: StatisticsQuery }) => (
  <Box my={5}>
    <Head>
      <title>{config.getTitle('Loo Statistics')}</title>
    </Head>

    <Container maxWidth={845}>
      <Text fontSize={6} fontWeight="bold" textAlign="center">
        <h1>Toilet Map Explorer</h1>
      </Text>
      <Spacer mb={5} />
      <Spacer mb={2} />
      <Text fontSize={4} fontWeight="bold">
        <h2>
          Total Toilets:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.total}
          </Text>
        </h2>
      </Text>
      <Spacer mb={1} />
      <Text fontSize={4} fontWeight="bold">
        <h2>
          Active:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.active}
          </Text>
        </h2>
      </Text>
      <Spacer mb={1} />
      <Text fontSize={4} fontWeight="bold">
        <h2>
          Removed:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.removed}
          </Text>
        </h2>
      </Text>
    </Container>
  </Box>
);

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const res = await ssrStatistics.getServerPage({}, req);
    console.log(res);
    return res;
  } catch (e: unknown) {
    console.log(e);
    return { props: { notFound: true } };
  }
};

// export const getStaticPaths = async () => {
//   return {
//     paths: [],
//     fallback: 'blocking',
//   };
// };

export default withApollo(Stats);

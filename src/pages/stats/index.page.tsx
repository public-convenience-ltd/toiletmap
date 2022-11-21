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
      <Text fontSize={5} fontWeight="bold">
        <h2>Overview</h2>
      </Text>
      <Spacer mb={2} />
      <Text fontSize={3}>
        <h3>
          Total Toilets:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.total}
          </Text>
        </h3>
      </Text>
      <Spacer mb={1} />
      <Text fontSize={3}>
        <h3>
          Active:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.active}
          </Text>
        </h3>
      </Text>
      <Spacer mb={1} />
      <Text fontSize={3}>
        <h3>
          Removed:
          <Text as="span" color={theme.colors.tertiary}>
            {statistics.removed}
          </Text>
        </h3>
      </Text>

      <Spacer mb={4} />
      <Text fontSize={5} fontWeight="bold">
        <h2>Area Breakdown</h2>
      </Text>
      <table>
        <tbody>
          <tr
            css={{
              textDecoration: 'underline',
              textDecorationThickness: '2px',
            }}
          >
            <th>Area</th>
            <th>Active Toilets</th>
            <th>Removed Toilets</th>
            <th>Total Toilets</th>
          </tr>
          {statistics.areaToiletCount.map((area) => (
            <tr key={area.name}>
              <td>{area.name}</td>
              <td>{area.active}</td>
              <td>{area.removed}</td>
              <td>{area.active + area.removed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  </Box>
);

export const getStaticProps: GetServerSideProps = async ({ req }) => {
  try {
    const res = await ssrStatistics.getServerPage({}, req);

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

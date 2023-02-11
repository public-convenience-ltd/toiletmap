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
import { css } from '@emotion/react';
import VisuallyHidden from '../../components/VisuallyHidden';
import Link from 'next/link';

const Stats = ({ data: { statistics } }: { data: StatisticsQuery }) => {
  const pageTitle = config.getTitle('Loo Statistics');

  return (
    <Box my={5}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden>
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold">
          <h1>Toilet Map Explorer</h1>
        </Text>
        <Spacer mb={5} />
        <Text fontSize={5} fontWeight="bold">
          <h2>Overview</h2>
        </Text>
        <Spacer mb={2} />
        <Text fontSize={3} fontWeight="bold">
          <h2>
            <Link href="/explorer/search">Search Tool 🔎</Link>
          </h2>
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
        <table
          css={css`
            border-collapse: collapse;
            td,
            th {
              padding: 0.5rem;
            }
            tr:nth-child(odd) td {
              background-color: ${theme.colors.lightGrey};
            }
            tr:nth-child(even) td {
              background-color: ${theme.colors.primary};
              color: white;
            }
          `}
        >
          <tbody>
            <tr css={{ borderBottom: '1pt solid black' }}>
              <th>
                <Text fontWeight={'bold'}>Area</Text>
              </th>
              <th>
                <Text fontWeight={'bold'}>Active Toilets</Text>
              </th>
              <th>
                <Text fontWeight={'bold'}>Removed Toilets</Text>
              </th>
              <th>
                <Text fontWeight={'bold'}>Total Toilets</Text>
              </th>
            </tr>
            {statistics.areaToiletCount
              // Order alphabetically
              .sort((a, b) => {
                return a.name.localeCompare(b.name);
              })
              .map((area) => (
                <tr key={area.name} css={{ borderBottom: '1px solid black' }}>
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
};

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

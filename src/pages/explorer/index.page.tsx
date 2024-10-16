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
        <div
          style={{
            display: 'inline-block',
            width: '100%',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          <Text fontSize={6} fontWeight="bold" color={theme.colors.darkGrey}>
            <h1>Toilet Map Explorer</h1>
          </Text>
          <Spacer mb={4} />

          <Text fontSize={5} fontWeight="bold" color={theme.colors.cool}>
            <h2>Overview</h2>
          </Text>
          <Spacer mb={2} />

          <Text fontSize={4}>
            <Link
              href="/explorer/search"
              css={css`
                display: inline-block;
                padding: 0.5rem 0.75rem;
                background-color: ${theme.colors.darkGrey};
                color: ${theme.colors.white};
                border-radius: ${theme.radii[3]}px;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.3s ease;
                &:hover {
                  background-color: ${theme.colors.primary};
                  color: ${theme.colors.white};
                }
                &:focus {
                  box-shadow: 0 0 0 3px ${theme.colors.aqua};
                } /*Brighter color for Accessibility*/
              `}
            >
              Go to Search Tool 🔎
            </Link>
          </Text>
          <Spacer mb={2} />
        </div>

        <div
          style={{
            display: 'inline-block',
            width: '100%',
            textAlign: 'center',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'inline-block', marginRight: '2rem' }}>
            <Text fontSize={3}>
              <h3>
                Total Toilets: &nbsp;
                <Text as="span" color={theme.colors.darkGrey} fontWeight="bold">
                  {statistics.total}
                </Text>
              </h3>
            </Text>
          </div>

          <div style={{ display: 'inline-block', marginRight: '2rem' }}>
            <Text fontSize={3}>
              <h3>
                Active: &nbsp;
                <Text as="span" color={theme.colors.green} fontWeight="bold">
                  {statistics.active}
                </Text>
              </h3>
            </Text>
          </div>

          <div style={{ display: 'inline-block' }}>
            <Text fontSize={3}>
              <h3>
                Removed: &nbsp;
                <Text as="span" color={theme.colors.grey} fontWeight="bold">
                  {statistics.removed}
                </Text>
              </h3>
            </Text>
          </div>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: '845px', // Same as the container width
            borderBottom: `2px solid ${theme.colors.primary}`,
            margin: '0 auto',
          }}
        />

        <Spacer mb={3} />

        <Text fontSize={5} fontWeight="bold" color={theme.colors.primary}>
          <h2>Area-wise Breakdown</h2>
        </Text>
        <Spacer mb={3} />

        <table
          css={css`
            border-collapse: collapse;
            width: 100%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            tr {
              &:nth-child(odd) {
                background-color: ${theme.colors.lightGrey};
              }
              &:nth-child(even) {
                background-color: ${theme.colors.white};
              }
            }
            th {
              background-color: ${theme.colors.darkGrey};
              color: ${theme.colors.white};
              padding: 0.75rem;
              text-align: left;
              text-align: left;
              &:nth-child(n + 2) {
                text-align: center; /*Center align for second column onward*/
              }
            }
            td {
              padding: 0.75rem;
              text-align: left;
              border-bottom: 1px solid ${theme.colors.grey};
              text-align: left;
              &:nth-child(n + 2) {
                text-align: center; /*Center align for second column onward*/
              }
            }
          `}
        >
          <thead>
            <tr>
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
          </thead>
          <tbody>
            {statistics.areaToiletCount
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((area) => (
                <tr key={area.name}>
                  <td>{area.name}</td>
                  <td>
                    <Text color={theme.colors.green}>{area.active}</Text>
                  </td>
                  <td>
                    <Text color={theme.colors.darkGrey}>{area.removed}</Text>
                  </td>
                  <td>
                    <Text color={theme.colors.darkGrey}>
                      {area.active + area.removed}
                    </Text>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Container>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  try {
    const res = await ssrStatistics.getServerPage({}, req);

    return res;
  } catch (e: unknown) {
    console.log(e);
    return { props: { notFound: true } };
  }
};

export default withApollo(Stats);

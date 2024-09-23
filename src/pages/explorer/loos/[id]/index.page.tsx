// Import Statements
import { ApolloError } from '@apollo/client';
import { css } from '@emotion/react';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getISODay } from 'date-fns';
import isEqual from 'lodash/isEqual';
import { GetServerSideProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

// GraphQL Types and Queries
import type {
  FindLooByIdQuery,
  LooReportFragmentFragment,
  LooReportHistoryQuery,
} from '../../../../api-client/graphql';
import {
  ssrFindLooById,
  ssrLooReportHistory,
} from '../../../../api-client/page';
import { withApollo } from '../../../../api-client/withApollo';

// Custom Components
import Box from '../../../../components/Box';
import CodeViewer, {
  MonacoOnInitializePane,
} from '../../../../components/CodeViewer/CodeViewer';
import Container from '../../../../components/Container';
import LooMapLoader from '../../../../components/LooMap/LooMapLoader';
import { useMapState } from '../../../../components/MapState';
import Notification from '../../../../components/Notification';
import Spacer from '../../../../components/Spacer';
import Text from '../../../../components/Text';
import VisuallyHidden from '../../../../components/VisuallyHidden';
import NotFound from '../../../404.page';

// Utilities and Constants
import config from '../../../../config';
import { WEEKDAYS, getTimeRangeLabel } from '../../../../lib/openingTimes';
import theme from '../../../../theme';

// Type Definitions

/**
 * Props for the LooPage component.
 */
interface LooPageProps {
  looData?: FindLooByIdQuery;
  reportData?: LooReportHistoryQuery;
  error?: ApolloError;
  notFound?: boolean;
}

/**
 * Props for the TimelineEntry component.
 */
interface TimelineEntryProps {
  report: LooReportFragmentFragment;
}

/**
 * Props for the TimelineEntry component.
 */
const TimelineEntry: FC<TimelineEntryProps> = ({ report }) => {
  return (
    <table
      css={css`
        border-collapse: collapse;
        width: 100%;
        td,
        th {
          padding: 0.5rem;
        }
        tr:nth-child(odd) td {
          background-color: ${theme.colors.white};
        }
        tr:nth-child(even) td {
          background-color: ${theme.colors.lightGrey};
        }
      `}
    >
      <tbody>
        <tr css={{ borderBottom: '1pt solid black' }}>
          <th>
            <Text fontWeight="bold">Key</Text>
          </th>
          <th>
            <Text fontWeight="bold">Value</Text>
          </th>
        </tr>
        {Object.entries(report)
          .filter(
            ([key]) =>
              key !== 'id' && key !== 'createdAt' && key !== '__typename',
          )
          .map(([key, value]) => (
            <tr
              key={`${key}-${report.id}`}
              css={{ borderBottom: '1px solid black' }}
            >
              <td css={{ width: '10rem' }}>{key}</td>
              <td>{diffValueMapping(key, value)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

/**
 * Utility function to map report values based on their keys.
 */
const diffValueMapping = (key: string, value: unknown) => {
  if (key === 'location') {
    const location = value as { lat: number; lng: number };
    return (
      <Box>
        <code>
          {location?.lat}, {location?.lng}
        </code>
      </Box>
    );
  }

  if (key === 'openingTimes') {
    if (!Array.isArray(value)) {
      return <code>{JSON.stringify(value)}</code>;
    }

    const openingTimes = value as Array<unknown[]>;
    const todayWeekdayIndex = getISODay(new Date()) - 1; // getISODay returns 1 (Monday) to 7 (Sunday)
    return (
      <ul>
        {openingTimes?.map((timeRange, i) => (
          <Box
            as="li"
            display="flex"
            justifyContent="space-between"
            key={i}
            padding={1}
            bg={i === todayWeekdayIndex ? theme.colors.primary : 'white'}
            color={i === todayWeekdayIndex ? 'white' : theme.colors.primary}
            width="15rem"
          >
            <span>{WEEKDAYS[i]}</span>
            <span>{getTimeRangeLabel(timeRange)}</span>
          </Box>
        ))}
      </ul>
    );
  }

  return <code>{JSON.stringify(value)}</code>;
};

/**
 * LooPage Component
 */
const LooPage: FC<LooPageProps> = ({ looData, reportData, notFound }) => {
  const [mapState, setMapState] = useMapState();
  const router = useRouter();
  const { message } = router.query;

  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const looCentre = looData?.loo;

  const [reportDiffHistory, setReportDiffHistory] = useState<
    LooReportFragmentFragment[]
  >([]);

  // Effect to handle first load
  useEffect(() => {
    setFirstLoad(false);
  }, []);

  // Effect to set initial map center
  useEffect(() => {
    if (
      looCentre &&
      firstLoad &&
      mapState?.locationServices?.isActive !== true
    ) {
      setMapState({ center: looCentre.location, focus: looCentre });
    }
  }, [
    firstLoad,
    looCentre,
    mapState?.locationServices?.isActive,
    message,
    router.isReady,
    setMapState,
  ]);

  // Effect to compute report differences
  useEffect(() => {
    if (reportData?.reportsForLoo) {
      const squashedSystemReports = reportData.reportsForLoo.reduce<
        LooReportFragmentFragment[]
      >((accumulatedReports, currentReport, i, reports) => {
        const nextReport = reports[i + 1];

        if (currentReport?.isSystemReport) {
          return accumulatedReports;
        }

        if (nextReport?.isSystemReport) {
          return [
            ...accumulatedReports,
            {
              ...currentReport,
              location: nextReport.location,
              geohash: nextReport.geohash,
            },
          ];
        }

        return [...accumulatedReports, currentReport];
      }, []);

      const diffHistory = squashedSystemReports.map((report, i) => {
        if (i === 0) {
          return report;
        }

        const constructedReport: LooReportFragmentFragment = { ...report };
        const prevReport = squashedSystemReports[i - 1];

        const skipList = ['createdAt', 'updatedAt'];

        Object.keys(report).forEach((key) => {
          if (
            isEqual(report[key], prevReport[key]) &&
            !skipList.includes(key)
          ) {
            delete constructedReport[key];
          }
        });

        return constructedReport;
      });

      setReportDiffHistory(diffHistory);
    }
  }, [reportData]);

  const pageTitle = config.getTitle('Home');

  // Handler for Monaco Editor Initialization
  const onInitializePane: MonacoOnInitializePane = useCallback(
    (_, editorRef) => {
      if (editorRef.current) {
        editorRef.current.setScrollTop(1);
        editorRef.current.setPosition({
          lineNumber: 2,
          column: 0,
        });
        editorRef.current.focus();
      }
    },
    [],
  );

  // Memoized Report History to prevent unnecessary computations
  const renderedReportHistory = useMemo(
    () =>
      reportDiffHistory.map((report) => (
        <TimelineItem key={report.id}>
          <TimelineOppositeContent>
            {new Date(report.createdAt).toLocaleDateString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <ul>
              <TimelineEntry report={report} />
            </ul>
          </TimelineContent>
        </TimelineItem>
      )),
    [reportDiffHistory],
  );

  // If data fetching resulted in not found
  if (notFound) {
    return (
      <>
        <Head>
          <title>{pageTitle}</title>
        </Head>
        <Box display="flex" height="40vh">
          <Box
            my={4}
            mx="auto"
            css={css`
              max-width: 360px;
              width: 100%;
            `}
          >
            <NotFound>
              <Box
                my={4}
                mx="auto"
                css={css`
                  max-width: 360px;
                  width: 100%;
                `}
              >
                <Notification allowClose>
                  Error fetching toilet data
                </Notification>
              </Box>
            </NotFound>
          </Box>
        </Box>
      </>
    );
  }

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
          <h1>
            Toilet Map <Link href="/explorer">Explorer</Link>
          </h1>
        </Text>
        <Spacer mb={4} />

        <Box
          display="flex"
          flexDirection="row"
          justifyContent="space-between"
          flexWrap="wrap"
          css={{ gap: '2rem' }}
        >
          {/* Name Section */}
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Name:</h2>
            </Text>
            <Text fontSize={4}>{looCentre?.name ?? 'Unnamed toilet'}</Text>
            {!looCentre?.name && (
              <Text as="span">
                <Link href={`/loos/${looCentre?.id}/edit`}>(Add a name)</Link>
              </Text>
            )}
          </Box>

          {/* Area Section */}
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Area:</h2>
            </Text>
            <Text fontSize={4}>{looCentre?.area[0]?.name}</Text>
            <Text fontSize={4}>{looCentre?.area[0]?.type}</Text>
          </Box>

          {/* Location Data Section */}
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Location data:</h2>
            </Text>
            <Text fontSize={4}>
              Geohash: {looCentre?.geohash.substring(0, 6)}
            </Text>
            <Text fontSize={4}>Lat: {looCentre?.location?.lat}</Text>
            <Text fontSize={4}>Lng: {looCentre?.location?.lng}</Text>
          </Box>
        </Box>

        <Spacer mb={4} />

        {/* Map and Code Viewer Section */}
        <Box display="flex" flexWrap="wrap">
          {/* Map Section */}
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            css={{ minWidth: '20rem' }}
            height="25rem"
          >
            <Text fontSize={4} fontWeight="bold">
              Toilet Location{' '}
              <Text as="span" fontSize={2}>
                <Link href={`/loos/${looCentre?.id}`}>(See it on the map)</Link>
              </Text>
            </Text>
            <Box css={{ minWidth: '20rem' }} flex={1}>
              {looCentre && (
                <LooMapLoader
                  staticMap
                  zoom={15}
                  showControls={false}
                  alwaysShowGeolocateButton={false}
                  controlPositionOverride="bottom"
                />
              )}
            </Box>
          </Box>

          {/* Code Viewer Section */}
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            css={{ minWidth: '20rem' }}
            height="25rem"
          >
            <Text fontSize={4} fontWeight="bold">
              Toilet Details (JSON)
            </Text>
            <Box flex={1}>
              <CodeViewer
                onInitializePane={onInitializePane}
                code={JSON.stringify(looCentre, null, 2)}
              />
            </Box>
          </Box>
        </Box>

        <Spacer mb={4} />

        {/* Timeline Section */}
        <Box
          display="flex"
          flexDirection="column"
          flex={1}
          css={{ minWidth: '20rem' }}
        >
          <Text fontSize={4} fontWeight="bold">
            <h2>Timeline</h2>
          </Text>
          <ThemeProvider theme={createTheme()}>
            <Timeline
              sx={{
                [`& .${timelineOppositeContentClasses.root}`]: {
                  flex: 0.2,
                },
              }}
            >
              {renderedReportHistory}
            </Timeline>
          </ThemeProvider>
        </Box>
      </Container>
    </Box>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const looDetailsResponse = await ssrFindLooById.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req },
    );

    const reportHistoryResponse = await ssrLooReportHistory.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req },
    );

    const problemFetchingLooData =
      looDetailsResponse.props.error && !looDetailsResponse.props.data;
    const problemFetchingReportHistory =
      reportHistoryResponse.props.error && !reportHistoryResponse.props.data;

    if (problemFetchingLooData || problemFetchingReportHistory) {
      return {
        props: {
          notFound: true,
          revalidate: 60,
        },
      };
    }
    return {
      props: {
        looData: looDetailsResponse.props.data,
        reportData: reportHistoryResponse.props.data,
      },
      revalidate: 60,
    };
  } catch {
    return {
      props: {
        notFound: true,
        revalidate: 60,
      },
    };
  }
};

// Static Paths (Fallback to 'blocking' for dynamic routes)
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

// Exporting the Component with Apollo HOC
export default withApollo(LooPage);

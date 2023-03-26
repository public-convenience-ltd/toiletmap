import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Box from '../../../../components/Box';
import VisuallyHidden from '../../../../components/VisuallyHidden';
import { useMapState } from '../../../../components/MapState';
import config from '../../../../config';
import { withApollo } from '../../../../api-client/withApollo';
import { GetServerSideProps } from 'next';
import {
  ssrFindLooById,
  ssrLooReportHistory,
} from '../../../../api-client/page';
import { useRouter } from 'next/router';
import Notification from '../../../../components/Notification';
import NotFound from '../../../404.page';
import { css } from '@emotion/react';
import type {
  FindLooByIdQuery,
  LooReportFragmentFragment,
  LooReportHistoryQuery,
} from '../../../../api-client/graphql';
import { ApolloError } from '@apollo/client';
import Container from '../../../../components/Container';
import Text from '../../../../components/Text';
import Spacer from '../../../../components/Spacer';
import LooMapLoader from '../../../../components/LooMap/LooMapLoader';
import CodeViewer, {
  MonacoOnInitializePane,
} from '../../../../components/CodeViewer/CodeViewer';
import Link from 'next/link';
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
import isEqual from 'lodash/isEqual';
import { WEEKDAYS, getTimeRangeLabel } from '../../../../lib/openingTimes';
import { getISODay } from 'date-fns';
import theme from '../../../../theme';

type CustomLooByIdComp = React.FC<{
  looData?: FindLooByIdQuery;
  reportData?: LooReportHistoryQuery;
  error?: ApolloError;
  notFound?: boolean;
}>;

const LooPage: CustomLooByIdComp = (props) => {
  const [mapState, setMapState] = useMapState();

  const router = useRouter();
  const { message } = router.query;

  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    setFirstLoad(false);
  }, []);

  const looCentre = props?.looData?.loo;
  useEffect(
    function setInitialMapCentre() {
      if (
        looCentre &&
        firstLoad &&
        mapState?.locationServices?.isActive !== true
      ) {
        setMapState({ center: looCentre?.location, focus: looCentre });
      }
    },
    [
      firstLoad,
      looCentre,
      mapState?.locationServices?.isActive,
      message,
      router.isReady,
      setMapState,
    ]
  );

  // Find the diff between the current and previous report
  const reportHistory = props?.reportData?.reportsForLoo;

  const [reportDiffHistory, setReportDiffHistory] = useState<
    LooReportFragmentFragment[]
  >([]);

  useEffect(() => {
    if (reportHistory) {
      const squashedSystemReports = reportHistory.reduce(
        (accumulatedReports, currentReport, i) => {
          const nextReport = reportHistory[i + 1];

          // If we're on a system report, skip it.
          if (currentReport?.isSystemReport) {
            return accumulatedReports;
          }

          // If the next report is a system report, merge it with the current report
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

          // Otherwise, just return the current report.
          return [...accumulatedReports, currentReport];
        },
        []
      );

      const diffHistory = squashedSystemReports.map((report, i) => {
        if (i === 0) {
          return report;
        }
        const constructedReport = { ...report };
        const prevReport = squashedSystemReports[i - 1];

        // Find out what's changed, only keep those items.
        // Skip `createdAt` and `updatedAt`, we don't want to remove these.
        const skipList = ['createdAt', 'updatedAt'];
        for (const key in report) {
          if (
            isEqual(report[key], prevReport[key]) &&
            !skipList.includes(key)
          ) {
            delete constructedReport[key];
          }
        }
        return constructedReport;
      });

      setReportDiffHistory(diffHistory);
    }
  }, [reportHistory]);

  const pageTitle = config.getTitle('Home');

  if (props?.notFound) {
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
              max-width: 360px; /* fallback */
              max-width: fit-content;
            `}
          >
            <NotFound>
              <Box
                my={4}
                mx="auto"
                css={css`
                  max-width: 360px; /* fallback */
                  max-width: fit-content;
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

  const onInitializePane: MonacoOnInitializePane = (
    monacoEditorRef,
    editorRef,
    model
  ) => {
    editorRef.current.setScrollTop(1);
    editorRef.current.setPosition({
      lineNumber: 2,
      column: 0,
    });
    editorRef.current.focus();
    monacoEditorRef.current.setModelMarkers(model[0], 'owner', null);
  };

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
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          flexWrap="wrap"
          css={{ gap: '2rem' }}
        >
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Name:</h2>
            </Text>
            <Text fontSize={4}>{looCentre?.name ?? 'Unnamed toilet'}</Text>
            <Text as="span">
              {!looCentre?.name && (
                <Link href={`/loos/${looCentre?.id}/edit`}>(Add a name)</Link>
              )}
            </Text>
          </Box>
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Area:</h2>
            </Text>
            <Text fontSize={4}>{looCentre?.area[0]?.name}</Text>
            <Text fontSize={4}>{looCentre?.area[0]?.type}</Text>
          </Box>
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
        <Box display={'flex'} flexWrap="wrap">
          <Box
            display="flex"
            flexDirection={'column'}
            flex={1}
            css={{ minWidth: '20rem' }}
            height="25rem"
          >
            <Text fontSize={4} fontWeight="bold">
              Toilet Location{' '}
              <Text as="span" fontSize={2}>
                <Link passHref href={`/loos/${looCentre?.id}`}>
                  (See it on the map)
                </Link>
              </Text>
            </Text>
            <Box css={{ minWidth: '20rem' }} flex={1}>
              {looCentre && (
                <LooMapLoader
                  focus={looCentre}
                  staticMap={true}
                  zoom={14}
                  showControls={false}
                  alwaysShowGeolocateButton={false}
                  controlPositionOverride="bottom"
                />
              )}
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection={'column'}
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
              ></CodeViewer>
            </Box>
          </Box>
        </Box>
        <Spacer mb={4} />
        <Box
          display="flex"
          flexDirection={'column'}
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
              {reportDiffHistory.map((report) => (
                // Only show non system location update reports for now.
                <TimelineItem key={report.id}>
                  <TimelineOppositeContent>
                    {new Date(report?.createdAt).toLocaleDateString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <ul>
                      <TimelineEntry key={report.id} report={report} />
                    </ul>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </ThemeProvider>
        </Box>
      </Container>
    </Box>
  );
};

const diffValueMapping = (key: string, value: unknown) => {
  if (key === 'location') {
    return (
      <Box>
        <code>
          {value?.lat}, {value?.lng}
        </code>
      </Box>
    );
  }

  if (key === 'openingTimes') {
    const todayWeekdayIndex = getISODay(new Date());
    return (
      <ul>
        {value?.map((timeRange: unknown[], i) => (
          <Box
            as="li"
            display="flex"
            justifyContent="space-between"
            key={i}
            padding={1}
            bg={i === todayWeekdayIndex - 1 ? theme.colors.primary : 'white'}
            color={i === todayWeekdayIndex - 1 ? 'white' : theme.colors.primary}
            width={'15rem'}
          >
            <span>{WEEKDAYS[i]}</span>
            <span>{getTimeRangeLabel(timeRange)}</span>
          </Box>
        ))}
      </ul>
    );
  }

  switch (key) {
    default:
      return <code>{JSON.stringify(value)}</code>;
  }
};

const TimelineEntry = ({ report }: { report: LooReportFragmentFragment }) => {
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
            <Text fontWeight={'bold'}>Key</Text>
          </th>
          <th>
            <Text fontWeight={'bold'}>Value</Text>
          </th>
        </tr>
        {Object.entries(report)
          .filter(([key]) => key !== 'id' && key !== 'createdAt')
          .map(([key, value]) => (
            <tr key={key + report.id} css={{ borderBottom: '1px solid black' }}>
              <td css={{ width: '10rem' }}>{key}</td>
              <td>{diffValueMapping(key, value)}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const looDetailsResponse = await ssrFindLooById.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req }
    );

    const reportHistoryResponse = await ssrLooReportHistory.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req }
    );

    const problemFetchingLooData =
      looDetailsResponse.props.error && !looDetailsResponse.props.data;
    const problemFetchingReportHistory =
      reportHistoryResponse.props.error && !reportHistoryResponse.props.data;

    if (problemFetchingLooData || problemFetchingReportHistory) {
      return {
        props: {
          notFound: true,
        },
      };
    }
    return {
      props: {
        looData: looDetailsResponse.props.data,
        reportData: reportHistoryResponse.props.data,
      },
    };
  } catch {
    return {
      props: {
        notFound: true,
      },
    };
  }
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withApollo(LooPage);

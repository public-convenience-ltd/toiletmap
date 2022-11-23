import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Box from '../../../../components/Box';
import VisuallyHidden from '../../../../components/VisuallyHidden';
import { useMapState } from '../../../../components/MapState';
import config from '../../../../config';
import { withApollo } from '../../../../api-client/withApollo';
import { GetServerSideProps } from 'next';
import { ssrFindLooById } from '../../../../api-client/page';
import { useRouter } from 'next/router';
import Notification from '../../../../components/Notification';
import NotFound from '../../../404.page';
import { css } from '@emotion/react';
import { FindLooByIdQuery } from '../../../../api-client/graphql';
import { ApolloError } from '@apollo/client';
import Container from '../../../../components/Container';
import Text from '../../../../components/Text';
import Spacer from '../../../../components/Spacer';
import LooMapLoader from '../../../../components/LooMap/LooMapLoader';
import CodeViewer, {
  MonacoOnInitializePane,
} from '../../../../components/CodeViewer/CodeViewer';
import Link from 'next/link';

type CustomLooByIdComp = React.FC<{
  data?: FindLooByIdQuery;
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

  const looCentre = props?.data?.loo;
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

      <Container maxWidth={850}>
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
            <Text fontSize={4}>{looCentre?.area[0].name}</Text>
            <Text fontSize={4}>{looCentre?.area[0].type}</Text>
          </Box>
          <Box>
            <Text fontSize={4} fontWeight="bold">
              <h2>Location data:</h2>
            </Text>
            <Text fontSize={4}>
              Geohash: {looCentre?.geohash.substring(0, 6)}
            </Text>
            <Text fontSize={4}>Lat: {looCentre?.location.lat}</Text>
            <Text fontSize={4}>Lng: {looCentre?.location.lng}</Text>
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
      </Container>
    </Box>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const res = await ssrFindLooById.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req }
    );

    if (res.props.error && !res.props.data) {
      return {
        props: {
          notFound: true,
        },
      };
    }
    return {
      props: {
        data: res.props.data,
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

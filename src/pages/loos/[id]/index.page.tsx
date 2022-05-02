import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Box from '../../../components/Box';
import Sidebar from '../../../components/Sidebar/Sidebar';
import VisuallyHidden from '../../../components/VisuallyHidden';
import { useMapState } from '../../../components/MapState';
import config from '../../../config';
import { withApollo } from '../../../api-client/withApollo';
import { GetServerSideProps } from 'next';
import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';
import { useRouter } from 'next/router';
import ToiletDetailsPanel from '../../../components/ToiletDetailsPanel';
import Notification from '../../../components/Notification';
import LooMap from '../../../components/LooMap/LooMapLoader';
import NotFound from '../../404.page';
import { css } from '@emotion/react';

const SIDEBAR_BOTTOM_MARGIN = 32;

const LooPage: PageFindLooByIdComp | React.FC<{ notFound?: boolean }> = (
  props
) => {
  const [mapState, setMapState] = useMapState();
  const [firstLoad, setFirstLoad] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setFirstLoad(false);
  }, []);

  // Just set our center when this page is an ingress route
  // This way you can click loos on the map without the map jerking about
  useEffect(() => {
    if (!router.isReady && firstLoad) {
      setMapState({
        center: props?.data?.loo?.location,
        focus: props?.data?.loo,
      });
    }
  }, [
    firstLoad,
    mapState.focus,
    props.data?.loo,
    props.data?.loo?.location,
    router,
    setMapState,
  ]);

  const [, setToiletPanelDimensions] = React.useState({});

  const { message } = router.query;

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

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden>
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <Box height="100%" display="flex" position="relative">
        <Box
          position="absolute"
          zIndex={1}
          top={0}
          left={[0, 3]}
          right={0}
          m={3}
          maxWidth={326}
          maxHeight={`calc(100% - 0px - ${SIDEBAR_BOTTOM_MARGIN}px)`}
          // center on small viewports
          mx={['auto', 0]}
        >
          <Sidebar />
        </Box>
        <LooMap
          center={mapState.center}
          zoom={mapState.zoom}
          controlsOffset={0}
        />
        {props?.data?.loo && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel
              data={props?.data?.loo}
              startExpanded={true}
              onDimensionsChange={setToiletPanelDimensions}
            >
              {config.messages[message as string] && (
                <Box
                  position="absolute"
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  justifyContent="center"
                  p={4}
                  pt={1}
                  pb={[4, 3, 4]}
                  bg={['white', 'white', 'transparent']}
                >
                  <Notification allowClose>
                    {config.messages[message as string]}
                  </Notification>
                </Box>
              )}
            </ToiletDetailsPanel>
          </Box>
        )}
      </Box>
    </>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  const { dbConnect } = await import('../../../api/db');
  await dbConnect();
  try {
    const res = await ssrFindLooById.getServerPage(
      {
        variables: { id: params.id as string },
      },
      { req }
    );
    if (res.props.error || !res.props.data) {
      return {
        props: {
          notFound: true,
        },
      };
    }
    return res;
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

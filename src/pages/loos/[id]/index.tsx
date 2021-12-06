import React, { useEffect } from 'react';
import Head from 'next/head';
import PageLayout from '../../../components/PageLayout';
import Box from '../../../components/Box';
import Sidebar from '../../../components/Sidebar';
import VisuallyHidden from '../../../components/VisuallyHidden';
import { useMapState } from '../../../components/MapState';
import config from '../../../config';
import { withApollo } from '../../../components/withApollo';
import { GetServerSideProps } from 'next';

import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';
import { useRouter } from 'next/router';
import { dbConnect } from '../../../api/db';
import ToiletDetailsPanel from '../../../components/ToiletDetailsPanel';
import Notification from '../../../components/Notification';
import LooMap from '../../../components/LooMap/LooMapLoader';

const SIDEBAR_BOTTOM_MARGIN = 32;

const LooPage: PageFindLooByIdComp = (props) => {
  const [mapState, setMapState] = useMapState();

  // Just set our center when this page is an ingress route
  // This way you can click loos on the map without the map jerking about
  useEffect(() => {
    setMapState({ center: props.data.loo.location });
  });

  const [toiletPanelDimensions, setToiletPanelDimensions] = React.useState({});

  const router = useRouter();
  const { message } = router.query;

  const pageTitle = config.getTitle('Home');

  return (
    <PageLayout mapCenter={mapState.center}>
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
          focus={props?.data?.loo}
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
              isLoading={false}
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
    </PageLayout>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  await dbConnect();
  const res = await ssrFindLooById.getServerPage(
    {
      variables: { id: params.id as string },
    },
    { req }
  );

  if (res.props.error || !res.props.data) {
    return {
      notFound: true,
    };
  }

  return res;
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withApollo(LooPage);

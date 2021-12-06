import React from 'react';
import Head from 'next/head';

import PageLayout from '../../components/PageLayout';
import Box from '../../components/Box';
import Sidebar from '../../components/Sidebar';
import VisuallyHidden from '../../components/VisuallyHidden';
import { useMapState } from '../../components/MapState';
import config from '../../config';
import { useRouter } from 'next/router';
import { withApollo } from '../../components/withApollo';
import { NextPage } from 'next';
import LooMap from '../../components/LooMap/LooMapLoader';

const SIDEBAR_BOTTOM_MARGIN = 32;

const MapPage: NextPage = () => {
  const router = useRouter();
  const [mapState] = useMapState();

  const center = React.useMemo(
    () => ({
      lat: parseFloat(router.query.lat as string),
      lng: parseFloat(router.query.lng as string),
    }),
    [router]
  );

  const pageTitle = config.getTitle('Area Map');

  return (
    <PageLayout mapCenter={mapState.center}>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden>
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <Box height="100vh" display="flex" position="relative">
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

        <LooMap center={center} zoom={mapState.zoom} controlsOffset={0} />
      </Box>
    </PageLayout>
  );
};

export default withApollo(MapPage);

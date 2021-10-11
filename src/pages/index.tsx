import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '../components/PageLayout';
import Box from '../components/Box';
import Sidebar from '../components/Sidebar';
import Notification from '../components/Notification';
import VisuallyHidden from '../components/VisuallyHidden';
import { useMapState } from '../components/MapState';
import config from '../config';
import { useRouter } from 'next/router';
import { withApollo } from '../components/withApollo';
import { NextPage } from 'next';
import { useFindLoosNearbyQuery } from '../api-client/graphql';
import useFilters from '../hooks/useFilters';

const SIDEBAR_BOTTOM_MARGIN = 32;
const MapLoader = () => <p>Loading map...</p>;
const LooMap = dynamic(() => import('../components/LooMap'), {
  loading: MapLoader,
  ssr: false,
});

const HomePage = () => {
  const router = useRouter();
  const { message } = router.query;
  const [mapState, setMapState] = useMapState();

  const { data } = useFindLoosNearbyQuery({
    variables: {
      lat: mapState.center.lat,
      lng: mapState.center.lng,
      radius: Math.ceil(mapState.radius),
    },
  });

  const { filters, filtered, setFilters } = useFilters(data?.loosByProximity);

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
          overflowY="auto"
          // center on small viewports
          mx={['auto', 0]}
        >
          <Sidebar
            filters={filters}
            onFilterChange={setFilters}
            onSelectedItemChange={(center) => setMapState({ center })}
            onUpdateMapPosition={setMapState}
            mapCenter={mapState.center}
          />
        </Box>

        <LooMap
          loos={filtered}
          center={mapState.center}
          zoom={mapState.zoom}
          onViewportChanged={setMapState}
          controlsOffset={0}
        />
      </Box>
    </PageLayout>
  );
};

export default withApollo(HomePage as NextPage);

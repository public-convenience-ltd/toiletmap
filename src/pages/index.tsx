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
import { GetServerSideProps, GetStaticPaths, NextPage } from 'next';
import useFilters from '../hooks/useFilters';
import { ssrFindLoosNearby } from '../api-client/page';
import handler, { getStaticApolloClient, server as SS } from './api';
import {
  FindLoosNearbyDocument,
  FindLoosNearbyQuery,
} from '../api-client/graphql';
import { getServerPageFindLoosNearby } from '../api-client/staticPage';

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

  const { filters, filtered, setFilters } = useFilters([]);

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
          center={mapState.center}
          zoom={mapState.zoom}
          onViewportChanged={setMapState}
          controlsOffset={0}
        />
      </Box>
    </PageLayout>
  );
};

const staticQueryVars = {
  lat: 54.093409,
  lng: -2.89479,
  radius: 1000000,
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  const { dbConnect } = require('../api/db');
  await dbConnect();

  const res = await getServerPageFindLoosNearby(
    {
      variables: { ...staticQueryVars },
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

export default withApollo(
  ssrFindLoosNearby.withPage(() => ({
    variables: staticQueryVars,
    ssr: true,
  }))(HomePage)
);

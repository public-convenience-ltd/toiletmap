import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '../../../components/PageLayout';
import Box from '../../../components/Box';
import Sidebar from '../../../components/Sidebar';
import VisuallyHidden from '../../../components/VisuallyHidden';
import { useMapState } from '../../../components/MapState';
import config from '../../../config';
import { withApollo } from '../../../components/withApollo';
import { GetServerSideProps } from 'next';
import useFilters from '../../../hooks/useFilters';
import { getServerPageMinimumViableLooResponse } from '../../../api-client/staticPage';
import { NormalizedCacheObject } from '@apollo/client';
import { Loo } from '../../../api-client/graphql';
import { useRouter } from 'next/router';
import getStaticPropsAllLoos from '../../../looCache';

const SIDEBAR_BOTTOM_MARGIN = 32;
const MapLoader = () => <p>Loading map...</p>;
const LooMap = dynamic(() => import('../../../components/LooMap'), {
  loading: MapLoader,
  ssr: false,
});

const LooPage: React.FC<{ data: NormalizedCacheObject }> = (props) => {
  const [mapState, setMapState] = useMapState();
  const router = useRouter();

  const loos = React.useMemo(() => {
    if (props.data) {
      return Object.values(props.data);
    }
    return [];
  }, [props.data]);

  const focused = loos.find((loo: Loo) => loo.id === router.query.id);
  const { filters, setFilters, filtered } = useFilters(loos);

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
          loos={filtered}
          focus={focused as Loo}
        />
      </Box>
    </PageLayout>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  const data = await getStaticPropsAllLoos();

  return { props: { data: data, looId: '' } };
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withApollo(LooPage);

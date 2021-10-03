import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '../../../components/PageLayout';
import Box from '../../../components/Box';
import Sidebar from '../../../components/Sidebar';
import VisuallyHidden from '../../../components/VisuallyHidden';
import { useMapState } from '../../../components/MapState';
import config, { FILTERS_KEY } from '../../../config';
import { useRouter } from 'next/router';
import { withApollo } from '../../../components/withApollo';
import { NextPage } from 'next';
import { useFindLoosNearbyQuery } from '../../../api-client/graphql';

const SIDEBAR_BOTTOM_MARGIN = 32;
const MapLoader = () => <p>Loading map...</p>;
const LooMap = dynamic(() => import('../../../components/LooMap'), {
  loading: MapLoader,
  ssr: false,
});

const MapPage = () => {
  const router = useRouter();
  const [mapState, setMapState] = useMapState();
  let initialState = config.getSettings(FILTERS_KEY);

  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialState[filter.id] = initialState[filter.id] || false;
  });

  const [filters, setFilters] = useState(initialState);

  // keep local storage and state in sync
  React.useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  const { data } = useFindLoosNearbyQuery({
    variables: {
      lat: mapState.center.lat,
      lng: mapState.center.lng,
      radius: Math.ceil(mapState.radius),
    },
  });

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  const toilets = React.useMemo(() => {
    if (data?.loosByProximity) {
      return data.loosByProximity.filter((toilet: { [x: string]: any }) =>
        applied.every((filter) => {
          const value = toilet[filter.id];

          if (value === null) {
            return false;
          }

          return !!value;
        })
      );
    }
    return [];
  }, [data?.loosByProximity, applied]);

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
          loos={toilets}
          center={mapState.center}
          zoom={mapState.zoom}
          onViewportChanged={setMapState}
          controlsOffset={0}
        />
      </Box>
    </PageLayout>
  );
};

export default withApollo(MapPage as NextPage);

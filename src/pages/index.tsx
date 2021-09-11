import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '../components/PageLayout';
import Box from '../components/Box';
import Sidebar from '../components/Sidebar';
import Notification from '../components/Notification';
import VisuallyHidden from '../components/VisuallyHidden';
import { useMapState } from '../components/MapState';
import config, { FILTERS_KEY } from '../config';
import { useRouter } from 'next/router';
import { withApollo } from '../components/withApollo';
import { NextPage } from 'next';
import { getServerPageFindLooById, getServerPageFindLoosNearby, useFindLooById, useFindLoosNearby } from '../api-client/page';



/**
 * SSR Migration plan
 * ---
 *
 * Look at getStaticProps to fetch loos for lat/lng at build time.
 * Look at using getStaticProps to pre-fetch /loos/[id].
 *
 * Use ISR (https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration)
 * ISR lets us regenerate loo pages and lat/lng loo list incrementally upon new requests
 * Set revalidate to throttle this by n seconds.
 */




const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = ({ initialPosition, ...props }) => {
  const [mapState, setMapState] = useMapState();
  const LooMap = React.useMemo(() => dynamic(() => import('../components/LooMap'), { loading: () => <p>Loading map...</p>, ssr: false, }), [])
  const ToiletDetailsPanel = React.useMemo(() => dynamic(() => import('../components/ToiletDetailsPanel'), { loading: () => <p>Loading map...</p>, ssr: false, }), [])
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

  const [toiletData, setToiletData] = React.useState([]);
  const variables = {
    lat: mapState.center.lat,
    lng: mapState.center.lng,
    radius: Math.ceil(mapState.radius),
  };
  const router = useRouter();

  /**
   * Fetch nearby loo data when the map state changes.
   * TODO: Try initial fetch using SSR.
   */
  React.useEffect(() => {
    async function fetchNearbyLooData() {
      const { props : toiletProps } = await getServerPageFindLoosNearby({variables});
      if(toiletProps.data !== undefined) {
        setToiletData(toiletProps.data.loosByProximity);
      }
    }
    fetchNearbyLooData();
  }, [mapState])


  const { id: selectedLooId } = router.query;


  /**
   * TODO: Fetch loo information using SSR.
   */
  const [selectedLoo, setSelectedLoo] = React.useState(null);
  const [loadingSelectedLoo, setLoadingSelectedLoo] = React.useState(false);
  React.useEffect(() => {
    async function fetchNearbyLooData() {
      const { props : toiletProps } = await getServerPageFindLooById({variables: {id: selectedLooId as string}});
      if(toiletProps.data !== undefined) {
        setSelectedLoo(toiletProps.data.loo);
        setLoadingSelectedLoo(false);
      }
    }
    setLoadingSelectedLoo(true);
    fetchNearbyLooData();
  }, [selectedLooId])

  // const { message } = queryString.parse(props.location.search);
  const message = "TODO"

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  // restrict the results to only those toilets which pass all of our filter requirements
  const toilets = toiletData.filter((toilet: { [x: string]: any; }) =>
    applied.every((filter) => {
      const value = toilet[filter.id];

      if (value === null) {
        return false;
      }

      return !!value;
    })
  );

  const isLooPage = router.pathname === '/loos/[id]';
  const [shouldCenter, setShouldCenter] = React.useState(isLooPage);

  // set initial map center to toilet if on /loos/:id
  React.useEffect(() => {
    if (shouldCenter && selectedLoo) {
      setMapState({
        center: selectedLoo.location,
      });

      // don't recenter the map each time the id changes
      setShouldCenter(false);
    }
  }, [selectedLoo, shouldCenter, setMapState]);

  // set the map position if initialPosition prop exists
  React.useEffect(() => {
    if (initialPosition) {
      setMapState({
        center: initialPosition,
      });
    }
  }, [initialPosition, setMapState]);

  const [toiletPanelDimensions, setToiletPanelDimensions] = React.useState({});

  const pageTitle = config.getTitle(
    isLooPage && selectedLoo ? selectedLoo.name || 'Unnamed Toilet' : 'Find Toilet'
  );

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
          maxHeight={`calc(100% - ${toiletPanelDimensions.height || 0
            }px - ${SIDEBAR_BOTTOM_MARGIN}px)`}
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
          loos={toilets.map((toilet: { id: string | string[]; }) => {
            if (toilet.id === selectedLooId) {
              return {
                ...toilet,
                isHighlighted: true,
              };
            }
            return toilet;
          })}
          center={mapState.center}
          zoom={mapState.zoom}
          onViewportChanged={setMapState}
          controlsOffset={toiletPanelDimensions.height}
        />

        {Boolean(selectedLooId) && selectedLoo && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel
              data={selectedLoo}
              isLoading={loadingSelectedLoo || !selectedLoo}
              startExpanded={!!message}
              onDimensionsChange={setToiletPanelDimensions}
            >
              {config.messages[message] && (
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
                  <Notification
                    allowClose
                    children={config.messages[message]}
                  />
                </Box>
              )}
            </ToiletDetailsPanel>
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

HomePage.propTypes = {
  initialPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default withApollo(HomePage as NextPage);

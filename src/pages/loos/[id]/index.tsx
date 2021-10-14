import React, { useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import PageLayout from '../../../components/PageLayout';
import Box from '../../../components/Box';
import Sidebar from '../../../components/Sidebar';
import Notification from '../../../components/Notification';
import VisuallyHidden from '../../../components/VisuallyHidden';
import ToiletDetailsPanel from '../../../components/ToiletDetailsPanel';
import { useMapState } from '../../../components/MapState';
import config from '../../../config';
import { useRouter } from 'next/router';
import { withApollo } from '../../../components/withApollo';
import { GetServerSideProps, GetStaticPaths } from 'next';
import useFilters from '../../../hooks/useFilters';
import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';

const SIDEBAR_BOTTOM_MARGIN = 32;
const MapLoader = () => <p>Loading map...</p>;
const LooMap = dynamic(() => import('../../../components/LooMap'), {
  loading: MapLoader,
  ssr: false,
});

const LooPage: PageFindLooByIdComp = (props) => {
  const loo = props.data.loo;
  const [mapState, setMapState] = useMapState();
  const router = useRouter();
  const { id, message } = router.query;

  const { filters, filtered, setFilters } = useFilters([]);

  // set initial map center to toilet if on /loos/:id
  //   React.useEffect(() => {
  //     if (shouldCenter && selectedLoo) {
  //       setMapState({
  //         center: selectedLoo.location,
  //       });

  //       // don't recenter the map each time the id changes
  //       setShouldCenter(false);
  //     }
  //   }, [selectedLoo, shouldCenter, setMapState]);

  const [toiletPanelDimensions, setToiletPanelDimensions] = React.useState({});

  const pageTitle = config.getTitle(loo.name || 'Unnamed Toilet');

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
          maxHeight={`calc(100% - ${
            toiletPanelDimensions.height || 0
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
          focus={loo}
          center={mapState.center}
          zoom={mapState.zoom}
          controlsOffset={toiletPanelDimensions.height}
        />

        <Box position="absolute" left={0} bottom={0} width="100%" zIndex={100}>
          <ToiletDetailsPanel
            data={loo}
            isLoading={false}
            startExpanded={true}
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
                <Notification allowClose>
                  {config.messages[message]}
                </Notification>
              </Box>
            )}
          </ToiletDetailsPanel>
        </Box>
      </Box>
    </PageLayout>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
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

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withApollo(
  ssrFindLooById.withPage((arg) => ({
    variables: { id: arg?.query?.id as string },
  }))(LooPage)
);

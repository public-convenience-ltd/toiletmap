import Head from 'next/head';
import PageLayout from '../components/PageLayout';
import Box from '../components/Box';
import Sidebar from '../components/Sidebar';
import VisuallyHidden from '../components/VisuallyHidden';
import { useMapState } from '../components/MapState';
import config from '../config';
import { withApollo } from '../components/withApollo';
import LooMap from '../components/LooMap/LooMapLoader';

const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = () => {
  const [mapState, setMapState] = useMapState();

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
          <Sidebar />
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

export default withApollo(HomePage);

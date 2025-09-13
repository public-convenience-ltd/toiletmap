import React, { useMemo } from 'react';

import Head from 'next/head';
import Box from '../components/Box';
import Sidebar from '../components/Sidebar/Sidebar';
import VisuallyHidden from '../design-system/utilities/VisuallyHidden';
import { useMapState } from '../components/MapState';
import { withApollo } from '../api-client/withApollo';
import { useEffect } from 'react';
import config from '../config';
import { useRouter } from 'next/router';

const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = () => {
  const [, setMapState] = useMapState();
  const router = useRouter();

  const lat = router.query.lat as string | undefined;
  const lng = router.query.lng as string | undefined;

  const initialCenter = useMemo(() => {
    return lat && lng
      ? { lat: parseFloat(lat), lng: parseFloat(lng) }
      : undefined;
  }, [lat, lng]);

  useEffect(() => {
    if (typeof initialCenter === 'undefined') {
      setMapState({ focus: undefined, searchLocation: undefined });
    } else {
      // If we're provided with an initial latitude / longitude, we centre the map there.
      setMapState({
        focus: undefined,
        searchLocation: undefined,
        center: initialCenter,
      });
    }
  }, [setMapState, initialCenter]);

  return (
    <>
      <Head>
        <title>{config.getTitle('Home')}</title>
      </Head>

      <VisuallyHidden as="div">{config.getTitle('Home')}</VisuallyHidden>

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
    </>
  );
};

export default withApollo(HomePage);

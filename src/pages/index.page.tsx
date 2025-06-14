import React from 'react';

import Head from 'next/head';
import Box from '../components/Box';
import Sidebar from '../design-system/components/Sidebar/Sidebar';
import VisuallyHidden from '../design-system/utilities/VisuallyHidden';
import { useMapState } from '../components/MapState';
import { withApollo } from '../api-client/withApollo';
import { useEffect } from 'react';
import config from '../config';

const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = () => {
  const [, setMapState] = useMapState();

  useEffect(() => {
    setMapState({ focus: undefined, searchLocation: undefined });
  }, [setMapState]);

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

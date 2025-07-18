import React from 'react';
import Head from 'next/head';
import { withApollo } from '../api-client/withApollo';
import { useEffect } from 'react';

import MapOverlay from '../design-system/components/MapOverlay';
import Sidebar from '../design-system/components/Sidebar';
import VisuallyHidden from '../design-system/utilities/VisuallyHidden';

import { useMapState } from '../components/MapState';
import config from '../config';

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

      <MapOverlay>
        <Sidebar />
      </MapOverlay>
    </>
  );
};

export default withApollo(HomePage);

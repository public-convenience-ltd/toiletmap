import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { withApollo } from '../../api-client/withApollo';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';

import { LooMapLoader } from '../../components/LooMap/LooMapLoader';
import { useMapState } from '../../components/MapState';
import config from '../../config';
import MapOverlay from '../../design-system/components/MapOverlay/MapOverlay';
import VisuallyHidden from '../../design-system/utilities/VisuallyHidden';

const Sidebar = dynamic(
  () => import('../../design-system/components/Sidebar/Sidebar'),
);

const MapPage: NextPage = () => {
  const router = useRouter();
  const [mapState] = useMapState();

  const center = React.useMemo(
    () => ({
      lat: parseFloat(router.query.lat as string),
      lng: parseFloat(router.query.lng as string),
    }),
    [router],
  );

  const pageTitle = config.getTitle('Area Map');

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden as="div">
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <MapOverlay>
        <Sidebar />
      </MapOverlay>

      <LooMapLoader center={center} zoom={mapState.zoom} controlsOffset={0} />
    </>
  );
};

export default withApollo(MapPage);

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { withApollo } from '../../api-client/withApollo';
import { useMapState } from '../MapState';
import PageLoading from '../PageLoading';

export const LooMapLoader = dynamic(() => import('./LooMap'), {
  loading: PageLoading,
  ssr: false,
});

const LooMap = () => {
  const [mapState] = useMapState();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    loaded && (
      <LooMapLoader
        center={mapState.center}
        zoom={mapState.zoom}
        controlsOffset={20}
        withAccessibilityOverlays={true}
      />
    )
  );
};

export default withApollo(LooMap);

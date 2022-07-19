import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { withApollo } from '../../api-client/withApollo';
import { useMapState } from '../MapState';
import PageLoading from '../PageLoading';
import { LooMapProps } from './LooMap';

export const LooMapLoader = dynamic(() => import('./LooMap'), {
  loading: PageLoading,
  ssr: false,
});

const LooMap = (props: LooMapProps) => {
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
        {...props}
      />
    )
  );
};

export default withApollo(LooMap);

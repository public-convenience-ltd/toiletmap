import dynamic from 'next/dynamic';
import { withApollo } from '../../api-client/withApollo';
import { useMapState } from '../MapState';
import PageLoading from '../PageLoading';

export const LooMapLoader = dynamic(() => import('./LooMap'), {
  loading: PageLoading,
  ssr: false,
});

const LooMap = () => {
  const [mapState] = useMapState();
  return (
    <LooMapLoader
      center={mapState.center}
      zoom={mapState.zoom}
      controlsOffset={0}
      withAccessibilityOverlays={true}
    />
  );
};

export default withApollo(LooMap);

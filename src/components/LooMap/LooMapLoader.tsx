import dynamic from 'next/dynamic';

const MapLoader = () => <p>Loading map...</p>;

const LooMap = dynamic(() => import('./LooMap'), {
  loading: MapLoader,
  ssr: false,
});

export default LooMap;

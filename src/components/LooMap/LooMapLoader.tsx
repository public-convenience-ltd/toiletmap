import dynamic from 'next/dynamic';
import PageLoading from '../PageLoading';

const LooMap = dynamic(() => import('./LooMap'), {
  loading: PageLoading,
  ssr: false,
});

export default LooMap;

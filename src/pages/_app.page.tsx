import { Suspense, useMemo } from 'react';
import Providers from '../components/Providers';
import { Analytics } from '@vercel/analytics/react';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import SiteLayout from '../design-system/components/SiteLayout';
import { useRouter } from 'next/router';
import LooMap from '../components/LooMap/LooMapLoader';
import '../design-system/stylesheet.css';

const App = (props) => {
  const router = useRouter();

  const sharedStatePaths = ['/', '/loos/[id]'];
  const key =
    sharedStatePaths.indexOf(router.pathname) > -1 ? 'shared' : router.asPath;
  const renderedMap = useMemo(
    () =>
      key === 'shared' ? (
        <Suspense>
          <LooMap minZoom={5} />
        </Suspense>
      ) : undefined,
    [key],
  );

  return (
    <>
      <Providers key={key}>
        <Auth0Provider>
          <SiteLayout {...props} map={renderedMap} />
        </Auth0Provider>
      </Providers>
      <Analytics />
    </>
  );
};

export default App;

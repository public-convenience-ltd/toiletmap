import { Suspense, useMemo } from 'react';
import Providers from '../components/Providers';
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';
import { useRouter } from 'next/router';
import LooMap from '../components/LooMap/LooMapLoader';
import '../design-system/components/stylesheet.css';

const App = (props) => {
  const router = useRouter();

  const sharedStatePaths = ['/', '/loos/[id]'];
  const key =
    sharedStatePaths.indexOf(router.pathname) > -1 ? 'shared' : router.asPath;

  const center = useMemo(
    () =>
      router.query.lat && router.query.lng
        ? {
            lat: parseFloat(router.query.lat as string),
            lng: parseFloat(router.query.lng as string),
          }
        : null,
    [router.query],
  );

  console.log(center);

  const renderedMap = useMemo(
    () =>
      key === 'shared' ? (
        <Suspense>
          <LooMap minZoom={5} {...(center ? { center } : {})} />
        </Suspense>
      ) : undefined,
    [key, center],
  );

  return (
    <>
      <Providers key={key}>
        <UserProvider>
          <Main {...props} map={renderedMap} />
        </UserProvider>
      </Providers>
      <Analytics />
    </>
  );
};

export default App;

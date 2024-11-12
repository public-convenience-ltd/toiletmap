import { Suspense, useMemo } from 'react';
import Providers from '../components/Providers';
import { Analytics } from '@vercel/analytics/react';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';
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
        <UserProvider>
          <Main {...props} map={renderedMap} />
        </UserProvider>
      </Providers>
      <Analytics />
    </>
  );
};

export default App;

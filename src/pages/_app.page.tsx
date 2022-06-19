import React, { useMemo } from 'react';
import Providers from '../components/Providers';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { useRouter } from 'next/router';
import LooMap from '../components/LooMap/LooMapLoader';

const App = (props) => {
  const router = useRouter();

  const sharedStatePaths = ['/', '/loos/[id]'];
  const key =
    sharedStatePaths.indexOf(router.pathname) > -1 ? 'shared' : router.asPath;
  const renderedMap = useMemo(
    () => (key === 'shared' ? <LooMap /> : undefined),
    [key]
  );
  return (
    <Providers key={key}>
      <UserProvider>
        <Main {...props} map={renderedMap} />
      </UserProvider>
    </Providers>
  );
};

export default App;

import React from 'react';
import Providers from '../components/Providers';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { useRouter } from 'next/router';

const App = (props) => {
  const router = useRouter();

  const sharedStatePaths = ['/', '/loos/[id]'];
  const key =
    sharedStatePaths.indexOf(router.pathname) > -1 ? 'shared' : router.asPath;

  return (
    <Providers key={key}>
      <UserProvider>
        <Main {...props} />
      </UserProvider>
    </Providers>
  );
};

export default App;

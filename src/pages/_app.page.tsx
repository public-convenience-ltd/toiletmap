import React from 'react';
import Providers from '../components/Providers';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';
import '@fortawesome/fontawesome-svg-core/styles.css';

const App = (props) => (
  <Providers>
    <UserProvider>
      <Main {...props} />
    </UserProvider>
  </Providers>
);

export default App;

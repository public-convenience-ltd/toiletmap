import Providers from '../components/Providers';
import { UserProvider } from '@auth0/nextjs-auth0';
import Main from '../components/Main';

const App = (props) => (
  <Providers>
    <UserProvider>
      <Main {...props} />
    </UserProvider>
  </Providers>
);

export default App;

// Polyfills
import 'resize-observer-polyfill';

import Box from '../components/Box';
import { Media } from '../components/Media';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Providers from '../components/Providers';

const App = ({ Component, pageProps }) => {
  return (
    <Providers>
      <Box display="flex" flexDirection="column" height="100%">
        <Header>
          <Footer />
        </Header>
        <Box position="relative" display="flex" flexGrow={1}>
          <Box
            as="main"
            flexGrow={1}
            // support screen readers in ie11
            role="main"
          >
            <Component {...pageProps} />
          </Box>
        </Box>

        <Box mt="auto">
          <Media greaterThan="sm">
            <Footer />
          </Media>
        </Box>
      </Box>
    </Providers>
  );
};

export default App;

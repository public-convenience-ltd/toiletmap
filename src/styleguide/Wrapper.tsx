import { ThemeProvider } from '@emotion/react';

import globalStyles from '../globalStyles';
import theme from '../theme';

const Wrapper = (props) => (
  <ThemeProvider theme={theme}>
    {globalStyles}

    {props.children}
  </ThemeProvider>
);

export default Wrapper;

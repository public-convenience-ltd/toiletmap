import React from 'react';

import Box from './Box';

const Container = (props) => (
  <Box {...props} mx="auto" maxWidth={1200} paddingLeft={3} paddingRight={3} />
);

export default Container;

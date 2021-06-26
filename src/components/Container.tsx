import React from 'react';

import Box, { BoxProps } from './Box';

const Container = (props: BoxProps) => {
  const { children, ...rest } = props;
  return (
    <Box
      maxWidth={'1200'}
      {...rest}
      mx="auto"
      paddingLeft={'3'}
      paddingRight={'3'}
    >
      {children}
    </Box>
  );
};

export default Container;

import React from 'react';

import Box, { BoxProps } from '../Box';

const Divider = (props: BoxProps) => (
  <Box
    as="hr"
    height="1px"
    width="100%"
    borderWidth={1}
    borderStyle="solid"
    borderColor="#dedede"
    my={4}
    {...props}
  />
);

/** @component */
export default Divider;

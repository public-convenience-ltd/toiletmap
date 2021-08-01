import React from 'react';

import Box, { BoxProps } from './Box';

const Container = (props: BoxProps) => {
  const {children, ...rest } = props;
  return (
    <Box maxWidth={"1200"} {...rest} children={children} mx="auto" paddingLeft={"3"} paddingRight={"3"} />
  )
};

export default Container;

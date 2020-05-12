import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

import Box from './Box';

const HEIGHT = 16;
const WIDTH = 27;
const OFFSET = 1;
const LENGTH = HEIGHT - OFFSET * 2;

const Inner = styled(Box)`
  transition: left 0.5s ease;
`;

const Switch = ({ checked, ...props }) => (
  <Box
    as="button"
    type="button"
    role="switch"
    {...props}
    aria-checked={checked}
    position="relative"
    bg={checked ? 'active' : 'primary'}
    height={HEIGHT}
    width={WIDTH}
    borderRadius={18}
  >
    <Inner
      position="absolute"
      top="1px"
      left={checked ? `calc(100% - ${LENGTH}px - ${OFFSET}px)` : `${OFFSET}px`}
      height={LENGTH}
      width={LENGTH}
      borderRadius="50%"
      bg="white"
    />
  </Box>
);

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
};

export default Switch;

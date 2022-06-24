import React from 'react';

import styled from '@emotion/styled';

import Box from '../Box';

const HEIGHT = 16;
const WIDTH = 27;
const OFFSET = 1;
const LENGTH = HEIGHT - OFFSET * 2;

const Inner = styled(Box)`
  transition: left 0.2s ease;
`;

interface SwitchProps extends Partial<HTMLButtonElement> {
  /** Determines whether the switch is on */
  checked: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = React.forwardRef(
  ({ checked, onClick, onChange, ...props }, ref) => {
    return (
      <Box
        as="button"
        type="button"
        role="switch"
        {...props}
        ref={ref}
        aria-checked={checked}
        position="relative"
        bg={checked ? 'tertiary' : 'primary'}
        height={`${HEIGHT}px`}
        width={`${WIDTH}px`}
        borderRadius={'18px'}
        onClick={() => {
          if (onClick) {
            onClick();
          }
          if (onChange) {
            onChange(!checked);
          }
        }}
      >
        <Inner
          as="span"
          position="absolute"
          top="1px"
          left={
            checked ? `calc(100% - ${LENGTH}px - ${OFFSET}px)` : `${OFFSET}px`
          }
          height={`${LENGTH}px`}
          width={`${LENGTH}px`}
          borderRadius="50%"
          bg="white"
        />
      </Box>
    );
  }
);

// eslint-disable-next-line functional/immutable-data
Switch.displayName = 'Switch';

/** @component */
export default Switch;

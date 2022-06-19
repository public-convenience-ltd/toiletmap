import React from 'react';
import { Switch as ChakraSwitch } from '@chakra-ui/react';

interface SwitchProps extends Partial<HTMLButtonElement> {
  /** Determines whether the switch is on */
  checked: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({ checked, onClick, onChange }) => {
  return (
    <ChakraSwitch
      checked={checked}
      onChange={() => {
        if (onClick) {
          onClick();
        }
        if (onChange) {
          onChange(!checked);
        }
      }}
    />
  );
};

// eslint-disable-next-line functional/immutable-data
Switch.displayName = 'Switch';

/** @component */
export default Switch;

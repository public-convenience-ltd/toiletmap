import { ComponentPropsWithoutRef, forwardRef } from 'react';

interface SwitchProps
  extends Omit<ComponentPropsWithoutRef<'button'>, 'onClick' | 'onChange'> {
  /** Determines whether the switch is on */
  checked: boolean;
  onClick?: () => void;
  onChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onClick, onChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        ref={ref}
        {...props}
        className="switch"
        aria-checked={checked}
        onClick={() => {
          if (onClick) {
            onClick();
          }
          if (onChange) {
            onChange(!checked);
          }
        }}
      >
        <span className="switch-thumb" />
      </button>
    );
  },
);

Switch.displayName = 'Switch';

export default Switch;

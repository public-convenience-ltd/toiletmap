import React from 'react';
import { InputHTMLAttributes } from 'react';

/**
 * 
A radio button is a graphical control element used to allow users to make a single selection from a list of multiple options.
 */

const Radio = React.forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function MyRadio(props, ref) {
  return (
    <>
      <label>
        <input type="radio" className="radio-input" ref={ref} {...props} />
        <span />
      </label>
    </>
  );
});

Radio.displayName = 'Radio';
export default Radio;

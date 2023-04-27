import Link from 'next/link';

import { ButtonProps } from './Button.types';
import { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  if (props.htmlElement === 'a') {
    return (
      <Link
        href={props.href}
        className={`button ${
          props.variant === 'secondary' ? `button--secondary` : ''
        }`}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
  return (
    <button
      className={`button ${
        props.variant === 'secondary' ? `button--secondary` : ''
      }`}
      ref={ref}
      {...props}
    >
      {props.children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

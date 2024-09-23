import Link from 'next/link';

import { ButtonProps } from './Button.types';
import { forwardRef } from 'react';

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  if (props.htmlElement === 'a') {
    // Remove htmlElement from props
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { htmlElement, ...rest } = props;

    return (
      <Link
        href={props.href}
        className={`button ${
          props.variant === 'secondary' ? `button--secondary` : ''
        }`}
        {...rest}
      >
        {props.children}
      </Link>
    );
  }

  // Remove htmlElement from props
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { htmlElement, ...rest } = props;

  return (
    <button
      className={`button ${
        props.variant === 'secondary' ? `button--secondary` : ''
      }`}
      ref={ref}
      {...rest}
    >
      {props.children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

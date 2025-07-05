import React from 'react';

import { VisuallyHiddenProps } from './VisuallyHidden.types';

const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  ...props
}) => {
  if (props.as === 'span') {
    return (
      <span className="visually-hidden" {...props}>
        {children}
      </span>
    );
  }

  if (props.as === 'caption') {
    return (
      <caption className="visually-hidden" {...props}>
        {children}
      </caption>
    );
  }

  return (
    <div className="visually-hidden" {...props}>
      {children}
    </div>
  );
};

export default VisuallyHidden;

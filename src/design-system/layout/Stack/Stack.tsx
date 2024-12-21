import React from 'react';
import StackProps from './Stack.types';

const Stack: React.FC<StackProps> = ({
  space = 's',
  direction = 'column',
  children,
}) => {
  const stackClass = `stack stack--${space} stack--${direction}`;

  return <div className={stackClass}>{children}</div>;
};

export default Stack;

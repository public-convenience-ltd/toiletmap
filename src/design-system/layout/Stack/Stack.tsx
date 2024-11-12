import React from 'react';
import StackProps from './Stack.types';

const Stack: React.FC<StackProps> = ({ space = 's', children }) => {
  const stackClass = `stack stack--${space}`;

  return <div className={stackClass}>{children}</div>;
};

export default Stack;

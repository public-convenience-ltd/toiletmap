import React from 'react';
import centerProps from './Center.types';

const Center: React.FC<centerProps> = ({
  /** used to center align text to the horizontal centre */
  text,
  /** include horizontal padding around the text */
  gutter,
  /** used for narrow blog and other article pages */
  article,
  children,
}) => {
  const centerClass =
    'center' +
    (text ? ' center--text' : '') +
    (gutter ? ' center--gutter' : '') +
    (article ? ' center--article' : '');

  return <div className={centerClass}>{children}</div>;
};

export default Center;

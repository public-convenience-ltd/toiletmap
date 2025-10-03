import { HTMLAttributes } from 'react';
import styles from './Heading.module.css';

type HeadingLevel = 1 | 2 | 3;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

const headingTag = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
} as const;

const Heading = ({ level = 1, className = '', ...rest }: HeadingProps) => {
  const Tag = headingTag[level];
  const classes = `${styles.heading} ${(styles as Record<string, string>)[`h${level}`]} ${className}`.trim();
  return <Tag className={classes} {...rest} />;
};

export default Heading;

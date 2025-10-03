import { HTMLAttributes } from 'react';
import styles from './Text.module.css';

type Tone = 'default' | 'emphasis';
type Size = 'regular' | 'small';

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: Tone;
  size?: Size;
  as?: 'p' | 'span';
}

const Text = ({
  tone = 'default',
  size = 'regular',
  as = 'p',
  className = '',
  ...rest
}: TextProps) => {
  const Tag = as;
  const classes = [
    styles.text,
    tone === 'emphasis' ? styles.emphasis : '',
    size === 'small' ? styles.small : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Tag className={classes} {...rest} />;
};

export default Text;

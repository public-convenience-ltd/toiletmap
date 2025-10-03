import { HTMLAttributes } from 'react';
import styles from './Stack.module.css';

type Direction = 'vertical' | 'horizontal';

type StackProps = HTMLAttributes<HTMLDivElement> & {
  direction?: Direction;
};

const Stack = ({ direction = 'vertical', className = '', ...rest }: StackProps) => (
  <div
    className={`${styles.stack} ${direction === 'horizontal' ? styles.inline : ''} ${className}`.trim()}
    {...rest}
  />
);

export default Stack;

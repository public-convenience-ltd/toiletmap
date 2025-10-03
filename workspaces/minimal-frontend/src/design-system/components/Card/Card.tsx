import { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 's' | 'm' | 'l';
}

const paddingMap: Record<Required<CardProps>['padding'], string> = {
  s: 'var(--space-m)',
  m: 'var(--space-l)',
  l: 'var(--space-xl)',
};

const Card = ({ padding = 'm', style, className = '', ...rest }: CardProps) => (
  <div
    className={`${styles.card} ${className}`.trim()}
    style={{ padding: paddingMap[padding], ...style }}
    {...rest}
  />
);

export default Card;

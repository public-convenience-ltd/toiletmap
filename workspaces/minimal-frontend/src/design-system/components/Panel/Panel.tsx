import { Children, ReactNode } from 'react';
import Heading from '../Heading/Heading';
import styles from './Panel.module.css';

export interface PanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  emptyContent?: ReactNode;
}

const Panel = ({ title, action, children, emptyContent = 'No data yet.' }: PanelProps) => {
  const hasContent = Children.count(children) > 0;

  return (
    <section className={styles.panel}>
      <div className={styles.heading}>
        <Heading level={3}>{title}</Heading>
        {action}
      </div>
      {hasContent ? <div className={styles.list}>{children}</div> : <div className={styles.empty}>{emptyContent}</div>}
    </section>
  );
};

export default Panel;

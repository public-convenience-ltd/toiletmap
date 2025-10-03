import { ReactNode } from 'react';
import styles from './AppShell.module.css';

export type AppShellProps = {
  header?: ReactNode;
  sidePanel?: ReactNode;
  children: ReactNode;
};

const AppShell = ({ header, sidePanel, children }: AppShellProps) => (
  <div className={styles.root}>
    {header ? <header className={styles.header}>{header}</header> : null}
    <div className={styles.body}>
      <main className={styles.main}>{children}</main>
      {sidePanel ? <aside className={styles.sidePanel}>{sidePanel}</aside> : null}
    </div>
  </div>
);

export default AppShell;

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './css/notfound.module.css';
import Logo from '../components/Logo';

export default () => {
  return (
    <>
      <div className={styles.bg} />
      <div className={styles.main}>
        <Logo />
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.info}>
          This could be because the page has moved, or you typed an address
          wrong.
        </p>
        <Link to="/">
          <button className={styles.homeBtn}>Take me back home!</button>
        </Link>
      </div>
    </>
  );
};

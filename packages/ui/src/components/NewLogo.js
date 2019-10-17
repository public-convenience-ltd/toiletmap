import React from 'react';
import { HashLink } from 'react-router-hash-link';

import styles from './css/logo.module.css';
import newlogo from '../images/newlogo.png';

export default () => (
  <HashLink
    to="/use-our-loos"
    title="Domestos - Use Our Loos Campaign"
    className={styles.wrapper}
    scroll={el => el.scrollIntoView(true)}
  >
    <img src={newlogo} alt="Domestos" className={styles.newimage} />
  </HashLink>
);

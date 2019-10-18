import React from 'react';
import { HashLink } from 'react-router-hash-link';

import styles from './css/logo.module.css';
import logo from '../images/domestos_use_our_loos_logo.png';

export default () => (
  <HashLink
    to="/use-our-loos"
    title="Domestos - Use Our Loos Campaign"
    className={styles.wrapper}
    scroll={el => el.scrollIntoView(true)}
  >
    <img src={logo} alt="Domestos" className={styles.useOurLoosLogoImage} />
  </HashLink>
);

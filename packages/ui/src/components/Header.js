import React, { Component } from 'react';
import { HashLink } from 'react-router-hash-link';

import styles from './css/header.module.css';
import domestosLogo from '../images/domestos_logo3.png';

import Logo from '../components/Logo';
import config from '../config';

class Header extends Component {
  render() {
    return (
      <header className={styles.header}>
        <Logo />
        {config.shouldShowSponsor() && (
          <HashLink
            to="/use-our-loos"
            title="Domestos - Use Our Loos Campaign"
            className={styles.sponsorWrapper}
            scroll={el => el.scrollIntoView(true)}
          >
            <span className={styles.sponsorTitle}>proudly sponsored by</span>
            <img
              src={domestosLogo}
              alt="Domestos"
              className={styles.sponsorLogo}
            />
          </HashLink>
        )}
      </header>
    );
  }
}

export default Header;

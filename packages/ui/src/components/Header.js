import React, { Component } from 'react';
import { HashLink } from 'react-router-hash-link';

import styles from './css/header.module.css';
import domestosLogo from '../images/domestos_logo3.png';
import domestosUseLoos from '../images/domestos_use_our_loos_logo.png';

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
            scroll={(el) => el.scrollIntoView(true)}
          >
            <img
              src={domestosUseLoos}
              alt="Domestos use our loos logo"
              className={styles.sponsorLogoLeft}
            />
            <span className={styles.sponsorTitle}>
              proudly
              <br />
              sponsored by
            </span>
            <img
              src={domestosLogo}
              alt="Domestos logo"
              className={styles.sponsorLogoRight}
            />
          </HashLink>
        )}
      </header>
    );
  }
}

export default Header;

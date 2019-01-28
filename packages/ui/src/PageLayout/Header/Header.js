import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import MediaQuery from 'react-responsive';

import styles from './Header.module.css';

import config from '../../config';

import VisuallyHidden from '../../design-system/src/components/VisuallyHidden';

import logo from '../../images/logo.svg';
import domestosLogo from '../../images/domestos_logo3.png';

class Header extends Component {
  render() {
    const titleFragment = (
      <h1 className={styles.title}>
        The Great British <span>Public Toilet Map</span>
      </h1>
    );

    const sponsorFragment = (
      <span className={styles.sponsorTitle}>proudly sponsored by</span>
    );

    return (
      <header className={styles.header}>
        <Link to="/" title="Go to home page" className={styles.logoWrapper}>
          <img
            src={logo}
            alt="'The Great British Toilet Map' logo"
            className={styles.logo}
          />

          <MediaQuery
            minWidth={config.viewport.mobile}
            children={titleFragment}
          />
          <MediaQuery maxWidth={config.viewport.mobile}>
            <VisuallyHidden children={titleFragment} />
          </MediaQuery>
        </Link>
        <HashLink
          to="/use-our-loos"
          title="Domestos - Use Our Loos Campaign"
          className={styles.sponsorWrapper}
          scroll={el => el.scrollIntoView(true)}
        >
          <MediaQuery
            minWidth={config.viewport.mobile}
            children={sponsorFragment}
          />
          <MediaQuery maxWidth={config.viewport.mobile}>
            <VisuallyHidden children={sponsorFragment} />
          </MediaQuery>

          <img src={domestosLogo} alt="Domestos" className={styles.logo} />
        </HashLink>
      </header>
    );
  }
}

export default Header;

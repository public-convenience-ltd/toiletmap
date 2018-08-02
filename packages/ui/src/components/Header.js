import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import styles from './css/header.module.css';
import logo from '../images/logo.svg';
import domestos_logo from '../images/domestos_logo.png';

class Header extends Component {
  render() {
    return (
      <header className={styles.header}>
        <Link to="/" title="Go to home page" className={styles.logoWrapper}>
          <img
            src={logo}
            alt="'The Great British Toilet Map' logo"
            className={styles.logo}
          />
          <span className={styles.title}>
            The Great British <span>Public Toilet Map</span>
          </span>
        </Link>
        <HashLink
          to="/about#use-our-loos"
          title="Domestos - Use Our Loos Campaign"
          className={styles.sponsorWrapper}
          scroll={el => el.scrollIntoView(true)}
        >
          <span className={styles.sponsorTitle}>proudly sponsored by</span>
          <img
            src={domestos_logo}
            alt="Domestos"
            className={styles.sponsorLogo}
          />
        </HashLink>
      </header>
    );
  }
}

export default Header;

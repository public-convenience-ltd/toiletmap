import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styles from './css/header.module.css';
import logo from '../images/logo.svg';

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
        <a
          href="http://web.rca.ac.uk/greatbritishpublictoiletmap"
          className={styles.donate}
          target="_blank"
          rel="noopener noreferrer"
        >
          Give a pound to spend a penny!
        </a>
      </header>
    );
  }
}

export default Header;

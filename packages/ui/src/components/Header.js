import React, { Component } from 'react';
import styles from './css/header.module.css';

import Logo from './Logo.js';
import NewLogo from './NewLogo.js';

class Header extends Component {
  render() {
    return (
      <header className={styles.header}>
        <Logo />
        <NewLogo />
      </header>
    );
  }
}

export default Header;

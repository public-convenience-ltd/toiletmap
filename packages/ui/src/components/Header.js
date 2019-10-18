import React, { Component } from 'react';

import styles from './css/header.module.css';

import Logo from '../components/Logo';

class Header extends Component {
  render() {
    return (
      <header className={styles.header}>
        <Logo />
      </header>
    );
  }
}

export default Header;

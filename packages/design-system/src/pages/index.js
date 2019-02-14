import React from 'react';
import { Link } from 'gatsby';

import styles from './index.module.css';

class Home extends React.Component {
  render() {
    return (
      <div className={styles.page}>
        <h1 className={styles.heading}>GBPTM Styleguide</h1>

        <Link to="/components/">View all components</Link>
      </div>
    );
  }
}

export default Home;

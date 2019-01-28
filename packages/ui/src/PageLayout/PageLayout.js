import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import Header from './Header';
import Footer from './Footer';

import styles from './PageLayout.module.css';

import config from '../config';

class PageLayout extends Component {
  render() {
    return (
      <div className={styles.appContainer}>
        <div className={styles.mainContainer}>
          <div className={styles.main}>
            <Header />

            <main className={styles.content}>
              <div className={styles.innerContent}>
                {React.cloneElement(this.props.main, this.props)}
              </div>
            </main>

            <Footer />
          </div>
        </div>

        <MediaQuery minWidth={config.viewport.mobile}>
          <aside data-testid="mainMap" className={styles.mapContainer}>
            {React.cloneElement(this.props.map, this.props)}
          </aside>
        </MediaQuery>
      </div>
    );
  }
}

PageLayout.propTypes = {
  main: PropTypes.element.isRequired,
  map: PropTypes.element.isRequired,
};

export default PageLayout;

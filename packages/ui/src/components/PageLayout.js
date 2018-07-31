import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MediaQuery from 'react-responsive';

import Header from './Header';
import Footer from './Footer';

import layout from './css/layout.module.css';

import config from '../config';

class PageLayout extends Component {
  render() {
    return (
      <div className={layout.appContainer}>
        <div className={layout.mainContainer}>
          <div className={layout.main}>
            <Header />

            <main className={layout.content}>
              <div>{React.cloneElement(this.props.main, this.props)}</div>
            </main>

            <Footer />
          </div>
        </div>

        <MediaQuery minWidth={config.viewport.mobile}>
          <aside className={layout.mapContainer}>
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

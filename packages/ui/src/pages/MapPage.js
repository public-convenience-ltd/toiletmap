import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';
import LooListItem from '../components/LooListItem';
import Notification from '../components/Notification';

import styles from './css/map-page.module.css';
import toiletMap from '../components/css/loo-map.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import {
  actionHighlight,
  actionUpdateCenter,
} from '../redux/modules/mapControls';
import { actionToggleViewMode } from '../redux/modules/app';
import { actionLogin, actionLogout } from '../redux/modules/auth';

import config from '../config';

export class MapPage extends Component {
  positionFromRouter() {
    return {
      lat: parseFloat(this.props.match.params.lat),
      lng: parseFloat(this.props.match.params.lng),
    };
  }

  componentDidMount() {
    this.props.actionUpdateCenter(this.positionFromRouter());
  }

  componentWillUnmount() {
    // Clear any marker highlighting when navigating away
    this.props.actionHighlight(null);
  }

  renderList(mobile) {
    var loos = this.props.loos;

    // Loading - either this is the first query of the user or they are on a
    // mobile and so can't rely on the map's loading spinner to know the loos
    // they see are outdated
    if (!loos || (this.props.loadingNearby && mobile)) {
      return (
        <Notification>
          <p>Fetching toilets&hellip;</p>
        </Notification>
      );
    }

    // No results
    if (loos && !loos.length) {
      return (
        <Notification>
          <p>
            No toilets found within {config.nearestRadius / 1000}
            km.
          </p>
        </Notification>
      );
    }

    return (
      <div>
        <h2 className={headings.large}>Nearest Toilets</h2>
        <ul className={styles.looList}>
          {loos &&
            loos.slice(0, config.nearestListLimit).map((loo, i) => (
              <li key={loo._id} className={styles.looListItem}>
                <LooListItem
                  loo={loo}
                  onHoverStart={_.partial(this.props.actionHighlight, loo._id)}
                  onHoverEnd={_.partial(this.props.actionHighlight, undefined)}
                  index={i + 1}
                />
              </li>
            ))}
        </ul>
      </div>
    );
  }

  renderMain() {
    var mode = this.props.app.viewMode;

    return (
      <div className={styles.container}>
        {/* Logged in message */}
        {this.props.isAuthenticated && (
          <Notification>
            <p>
              Logged in. <button onClick={this.props.doLogout}>Log out</button>
            </p>
          </Notification>
        )}

        <div className={layout.controls}>
          {config.allowAddEditLoo && (
            <Link to="/report" className={controls.btn}>
              Add a toilet
            </Link>
          )}

          <MediaQuery maxWidth={config.viewport.mobile}>
            <button
              className={controls.btn}
              onClick={this.props.actionToggleViewMode}
            >
              {mode === 'list' ? 'View map' : 'View list'}
            </button>
          </MediaQuery>
        </div>

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          {mode === 'list' && this.renderList(true)}
          {mode === 'map' && (
            <div className={styles.mobileMap}>
              <div className={toiletMap.map}>{this.renderMap()}</div>
            </div>
          )}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {this.renderList(false)}
        </MediaQuery>
      </div>
    );
  }

  renderMap() {
    return (
      <NearestLooMap
        mapProps={{ initialPosition: this.positionFromRouter() }}
        numberNearest
      />
    );
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

MapPage.propTypes = {
  loos: PropTypes.array,
};

var mapStateToProps = state => ({
  geolocation: state.geolocation,
  mapControls: state.mapControls,
  loos: state.loos.nearby,
  app: state.app,
  isAuthenticated: state.auth.isAuthenticated,
  loadingNearby: state.loos.loadingNearby,
});

var mapDispatchToProps = {
  actionHighlight,
  actionUpdateCenter,
  actionToggleViewMode,
  doLogout: actionLogout,
  doLogin: actionLogin,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(MapPage));

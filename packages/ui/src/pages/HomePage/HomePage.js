import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import Button from '../../design-system/src/components/Button';
import LinkButton from '../../design-system/src/components/LinkButton';
import Group from '../../design-system/src/components/Group';
import Heading from '../../design-system/src/components/Heading';
import DismissibleBox from '../../design-system/src/components/DismissibleBox';
import Notification from '../../design-system/src/components/Notification';
import VerticalSpacing from '../../design-system/src/components/VerticalSpacing';

import LooItem from '../../LooItem';
import PageLayout from '../../PageLayout';
import NearestLooMap from '../../NearestLooMap';

import styles from './HomePage.module.css';

import {
  actionHighlight,
  actionUpdateCenter,
} from '../../redux/modules/mapControls';
import { actionToggleViewMode } from '../../redux/modules/app';
import { actionLogin, actionLogout } from '../../redux/modules/auth';

import config from '../../config';

export class HomePage extends Component {
  componentDidMount() {
    var center = this.props.mapControls.center;

    if (!this.props.loos) {
      this.props.actionUpdateCenter(center);
    }
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
        <Heading headingLevel={2} size="large">
          Nearest Toilets
        </Heading>
        <ul className={styles.looList}>
          {loos &&
            loos.slice(0, config.nearestListLimit).map((loo, i) => (
              <li key={loo._id} className={styles.looListItem}>
                <LooItem
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

  renderWelcome() {
    var content = `
            <p>The ${
              config.nearestListLimit
            } nearest toilets are listed below. Click more info to find out about
            each toilet's features.</p><p>You can set preferences to highlight toilets that meet your specific
            needs.</p>
        `;

    return (
      <DismissibleBox persistKey="home-welcome" title="Hi!" content={content} />
    );
  }

  renderMain() {
    var mode = this.props.app.viewMode;

    return (
      <div className={styles.container}>
        {/* Logged in message */}
        {this.props.isAuthenticated && (
          <React.Fragment>
            <Notification>
              <p>
                Logged in.{' '}
                <button onClick={this.props.doLogout}>Log out</button>
              </p>
            </Notification>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Group direction="row">
          {config.allowAddEditLoo && (
            <LinkButton to="/report" data-testid="add-a-toilet">
              Add a toilet
            </LinkButton>
          )}

          <MediaQuery maxWidth={config.viewport.mobile}>
            <Button onClick={this.props.actionToggleViewMode}>
              {mode === 'list' ? 'View map' : 'View list'}
            </Button>
          </MediaQuery>
        </Group>
        <VerticalSpacing />

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          {mode === 'list' && this.renderWelcome()}
          {mode === 'list' && this.renderList(true)}
          {mode === 'map' && (
            <div className={styles.mobileMap}>{this.renderMap()}</div>
          )}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {this.renderWelcome()}
          {this.renderList(false)}
        </MediaQuery>
      </div>
    );
  }

  renderMap() {
    return <NearestLooMap numberNearest />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

HomePage.propTypes = {
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
)(HomePage);

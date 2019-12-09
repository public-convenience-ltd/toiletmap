import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';
import DismissableBox from '../components/DismissableBox';
import LooListItem from '../components/LooListItem';
import Notification from '../components/Notification';

import styles from './css/home-page.module.css';
import toiletMap from '../components/css/loo-map.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import { useQuery, gql } from '@apollo/client';
import { loader } from 'graphql.macro';
import WithApolloClient from '../components/WithApolloClient';

import config from '../config';

const FIND_NEARBY = loader('../components/findLoosNearby.graphql');

const HomePage = function(props) {
  const [highlight, setHighlight] = useState();
  const { apolloClient } = props;

  const getMapControls = () => {
    const { mapControls } = apolloClient.readQuery({
      query: gql`
        query getMapControls {
          mapControls {
            center {
              lat
              lng
            }
            viewMap
          }
        }
      `,
    });
    return mapControls;
  };

  const [mapControls, setMapControls] = useState(_.cloneDeep(getMapControls()));

  const { loading, data, error } = useQuery(FIND_NEARBY, {
    variables: {
      ...mapControls.center,
      radius: config.nearestRadius,
    },
  });

  const toggleViewMode = () => {
    let newVal = !mapControls.viewMap;

    apolloClient.writeQuery({
      query: gql`
        query getMapControls {
          mapControls {
            viewMap
          }
        }
      `,
      data: {
        mapControls: {
          viewMap: newVal,
        },
      },
    });

    setMapControls({
      ...mapControls,
      viewMap: newVal,
    });
  };

  const onUpdateCenter = center => {
    // We don't need to handle a global state update, that's done in
    // NearestLooMap
    setMapControls({
      ...mapControls,
      center,
    });
  };

  const renderList = mobile => {
    // Loading - either this is the first query of the user or they are on a
    // mobile and so can't rely on the map's loading spinner to know the loos
    // they see are outdated
    if (loading) {
      return (
        <Notification>
          <p>Fetching toilets&hellip;</p>
        </Notification>
      );
    }

    if (error || !data || !data.loosByProximity) {
      console.error(error || data.loosByProximity);
      return (
        <Notification>
          <p>Oops, there was a problem finding toilets.</p>
          <p>Consider checking your internet connection.</p>
        </Notification>
      );
    }

    var loos = data.loosByProximity;

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
              <li key={loo.id} className={styles.looListItem}>
                <LooListItem
                  center={mapControls.center}
                  loo={loo}
                  onHoverStart={() => setHighlight(loo.id)}
                  onHoverEnd={() => setHighlight()}
                  index={i + 1}
                />
              </li>
            ))}
        </ul>
      </div>
    );
  };

  const renderWelcome = () => {
    var content = `
            <p>The ${config.nearestListLimit} nearest toilets are listed below. Click more info to find out about
            each toilet's features.</p><p>You can set preferences to highlight toilets that meet your specific
            needs.</p>
        `;

    return (
      <DismissableBox persistKey="home-welcome" title="Hi!" content={content} />
    );
  };

  const renderMain = () => {
    var viewMap = mapControls.viewMap;

    return (
      <div className={styles.container}>
        {/* TODO Logged in message */}
        {props.isAuthenticated && (
          <Notification>
            <p>
              Logged in.{' '}
              <button onClick={/* TODO */ props.doLogout}>Log out</button>
            </p>
          </Notification>
        )}

        <div className={layout.controls}>
          {config.allowAddEditLoo && (
            <Link
              to="/report"
              className={controls.btn}
              data-testid="add-a-toilet"
            >
              Add a toilet
            </Link>
          )}

          <MediaQuery maxWidth={config.viewport.mobile}>
            <button className={controls.btn} onClick={toggleViewMode}>
              {viewMap ? 'View list' : 'View map'}
            </button>
          </MediaQuery>
        </div>

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          {!viewMap && renderWelcome()}
          {!viewMap && renderList(true)}
          {viewMap && (
            <div className={styles.mobileMap}>
              <div className={toiletMap.map}>{renderMap()}</div>
            </div>
          )}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {renderWelcome()}
          {renderList(false)}
        </MediaQuery>
      </div>
    );
  };

  const renderMap = () => {
    return (
      <NearestLooMap
        numberNearest
        highlight={highlight}
        onUpdateCenter={onUpdateCenter}
        overrideLoos={data ? data.loosByProximity : []}
      />
    );
  };

  return <PageLayout main={renderMain()} map={renderMap()} />;
};

HomePage.propTypes = {
  loos: PropTypes.array,
};

const HomePageWithApolloClient = props => (
  <WithApolloClient>
    <HomePage {...props} />
  </WithApolloClient>
);

export default HomePageWithApolloClient;

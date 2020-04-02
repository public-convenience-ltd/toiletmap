import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';

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

import { useQuery, useMutation, gql } from '@apollo/client';
import { loader } from 'graphql.macro';

import config from '../config';

const FIND_NEARBY = loader('../components/findLoosNearby.graphql');

const GET_MAP_CONTROLS = gql`
  {
    mapCenter @client {
      lat
      lng
    }
    viewMap @client
    mapRadius @client
  }
`;

const GET_AUTH_STATUS = gql`
  {
    userData @client {
      loggedIn
    }
  }
`;

const LOGOUT = gql`
  mutation logout {
    logoutUser @client
  }
`;

const TOGGLE_VIEW_MODE = gql`
  mutation ToggleViewMode {
    toggleViewMode @client
  }
`;

const HomePage = (props) => {
  const [highlight, setHighlight] = useState();

  const { loading: loadingMapControls, data: mapControlsData } = useQuery(
    GET_MAP_CONTROLS
  );

  let mapControls = {};
  if (!loadingMapControls) {
    mapControls = {
      center: mapControlsData.mapCenter,
      viewMap: mapControlsData.viewMap,
      radius: mapControlsData.mapRadius,
    };
  }

  const { loading: loadingUserData, data: userDataData } = useQuery(
    GET_AUTH_STATUS
  );

  let userData = {};
  if (!loadingUserData) {
    userData = userDataData.userData;
  }

  const [logoutMutation] = useMutation(LOGOUT);
  const logout = () =>
    props.auth.reactContextLogout(logoutMutation, props.history);

  const { loading, data, error } = useQuery(FIND_NEARBY, {
    variables: {
      ...mapControls.center,
      radius: Math.ceil(
        mapControls.viewMap ? mapControls.radius : config.nearestRadius
      ),
    },
    skip: loadingMapControls,
  });

  const [mutateToggleViewMode] = useMutation(TOGGLE_VIEW_MODE);
  const toggleViewMode = () => {
    mutateToggleViewMode();
  };

  const renderList = (mobile) => {
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

    const loos = data.loosByProximity;

    // No results
    if (loos && !loos.length) {
      return (
        <Notification>
          <p>No toilets found nearby. Try zooming the map out.</p>
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

  const welcomFragment = (
    <DismissableBox
      persistKey="home-welcome"
      title="Hi!"
      content={
        <>
          <p>
            The {config.nearestListLimit} nearest toilets are listed below.
            Click more info to find out about each toilet's features.
          </p>
          <p>
            You can set preferences to highlight toilets that meet your specific
            needs.
          </p>
        </>
      }
    />
  );

  const renderMap = () => {
    let mapProps = props.initialPosition
      ? {
          initialPosition: props.initialPosition,
        }
      : {};

    return (
      <NearestLooMap
        numberNearest
        highlight={highlight}
        overrideLoos={data ? data.loosByProximity : []}
        mapProps={mapProps}
      />
    );
  };

  const renderMain = () => {
    if (loadingMapControls || loadingUserData) {
      return <></>;
    }

    const { viewMap } = mapControls;

    return (
      <div className={styles.container}>
        {userData.loggedIn && (
          <Notification>
            <p>
              Logged in. <button onClick={logout}>Log out</button>
            </p>
          </Notification>
        )}

        <div className={layout.controls}>
          {config.allowAddEditLoo && (
            <Link
              to={`/report?lat=${mapControlsData.mapCenter.lat}&lng=${mapControlsData.mapCenter.lng}`}
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
          {!viewMap && welcomFragment}
          {!viewMap && renderList(true)}
          {viewMap && (
            <div className={styles.mobileMap}>
              <div className={toiletMap.map}>{renderMap()}</div>
            </div>
          )}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {welcomFragment}
          {renderList(false)}
        </MediaQuery>
      </div>
    );
  };

  return <PageLayout main={renderMain()} map={renderMap()} />;
};

HomePage.propTypes = {
  // The authentication object
  auth: PropTypes.object,
  // An initial position
  initialPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default HomePage;

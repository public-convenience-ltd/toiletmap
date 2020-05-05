import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import LooListItem from '../components/LooListItem';
import Notification from '../components/Notification';

import styles from './css/home-page.module.css';
import toiletMap from '../components/css/loo-map.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import { useQuery, useMutation, gql } from '@apollo/client';

import config from '../config';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';
import { useAuth } from '../Auth';

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

const HomePage = (props) => {
  const auth = useAuth();
  const [highlightedLooId, setHighlightedLooId] = useState();

  // Auth
  const { loading: loadingAuthStatus, data: authStatusData } = useQuery(
    GET_AUTH_STATUS
  );

  const userData = authStatusData ? authStatusData.userData : {};

  const [logoutMutation] = useMutation(LOGOUT);

  const logout = () => auth.reactContextLogout(logoutMutation, props.history);

  // Map
  const [showMapView, setShowMapView] = React.useState(true);

  const [mapPosition, setMapPosition] = useMapPosition(config.fallbackLocation);

  const { data: loos, loading, error } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: Math.ceil(
        showMapView ? mapPosition.radius : config.nearestRadius
      ),
    },
  });

  const renderList = () => {
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

    if (error || !loos) {
      console.error(error);
      return (
        <Notification>
          <p>Oops, there was a problem finding toilets.</p>
          <p>Consider checking your internet connection.</p>
        </Notification>
      );
    }

    // No results
    if (!loos.length) {
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
                  mapCenter={mapPosition.center}
                  loo={loo}
                  onHoverStart={() => setHighlightedLooId(loo.id)}
                  onHoverEnd={() => setHighlightedLooId()}
                  markerLabel={i + 1}
                />
              </li>
            ))}
        </ul>
      </div>
    );
  };

  const loosWithHighlight = loos.map((loo) => ({
    ...loo,
    isHighlighted: highlightedLooId === loo.id,
  }));

  const mapFragment = (
    <LooMap
      loos={loosWithHighlight}
      markerLabel={(index) => (index < 5 ? index + 1 : undefined)}
      center={mapPosition.center}
      zoom={mapPosition.zoom}
      onViewportChanged={setMapPosition}
      onSearchSelectedItemChange={setMapPosition}
      showContributor
      showCenter
      showSearchControl
      showLocateControl
    />
  );

  const renderMain = () => {
    if (loadingAuthStatus) {
      return null;
    }

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
              to={`/report?lat=${mapPosition.center.lat}&lng=${mapPosition.center.lng}`}
              className={controls.btn}
              data-testid="add-a-toilet"
            >
              Add a toilet
            </Link>
          )}

          <MediaQuery maxWidth={config.viewport.mobile}>
            <button
              className={controls.btn}
              onClick={() => setShowMapView(!showMapView)}
            >
              {showMapView ? 'View list' : 'View map'}
            </button>
          </MediaQuery>
        </div>

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          {showMapView ? (
            <div className={styles.mobileMap}>
              <div className={toiletMap.map}>{mapFragment}</div>
            </div>
          ) : (
            renderList()
          )}
        </MediaQuery>
        <MediaQuery minWidth={config.viewport.mobile}>
          {renderList()}
        </MediaQuery>
      </div>
    );
  };

  return <PageLayout main={renderMain()} map={mapFragment} />;
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

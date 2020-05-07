import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import Notification from '../components/Notification';

import styles from './css/home-page.module.css';
import toiletMap from '../components/css/loo-map.module.css';
import layout from '../components/css/layout.module.css';
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

  // Auth
  const { loading: loadingAuthStatus, data: authStatusData } = useQuery(
    GET_AUTH_STATUS
  );

  const userData = authStatusData ? authStatusData.userData : {};

  const [logoutMutation] = useMutation(LOGOUT);

  const logout = () => auth.reactContextLogout(logoutMutation, props.history);

  // Map
  const [mapPosition, setMapPosition] = useMapPosition(config.fallbackLocation);

  const { data: loos } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: Math.ceil(mapPosition.radius),
    },
  });

  // Set the map position if initialPosition prop exists
  React.useEffect(() => {
    if (props.initialPosition) {
      setMapPosition({
        center: props.initialPosition,
      });
    }
  }, [props.initialPosition, setMapPosition]);

  const mapFragment = (
    <LooMap
      loos={loos}
      center={mapPosition.center}
      zoom={mapPosition.zoom}
      onViewportChanged={setMapPosition}
      onSearchSelectedItemChange={setMapPosition}
      showContributor
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
        </div>

        <MediaQuery
          maxWidth={config.viewport.mobile}
          className={styles.mobileContent}
        >
          <div className={styles.mobileMap}>
            <div className={toiletMap.map}>{mapFragment}</div>
          </div>
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

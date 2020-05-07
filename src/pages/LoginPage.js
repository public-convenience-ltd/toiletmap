import React from 'react';

import config from '../config';

import { useAuth } from '../Auth';
import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

const LoginPage = (props) => {
  const auth = useAuth();
  const [mapPosition, setMapPosition] = useMapPosition();

  const { data: loos } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
  });

  const mainFragment = (
    <div>
      <div>
        <div className={layout.controls}>
          {config.showBackButtons && (
            <button onClick={props.history.goBack} className={controls.btn}>
              Back
            </button>
          )}
        </div>
      </div>

      <h2 className={headings.large}>Hello! What's your name?</h2>

      <p>Before you can contribute data we'll need to know who to thank.</p>
      <p>
        We'll only store the first part of the email address you give us against
        the data you contribute.
      </p>
      <p>Login or sign up to let us know you're real.</p>

      <div className={controls.btnStack}>
        <button onClick={auth.login} className={controls.btn}>
          Log In/Sign Up
        </button>
      </div>
    </div>
  );

  return (
    <PageLayout
      main={mainFragment}
      map={
        <LooMap
          loos={loos}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          onViewportChanged={setMapPosition}
          showContributor
          showSearchControl
          onSearchSelectedItemChange={setMapPosition}
          showLocateControl
        />
      }
    />
  );
};

export default LoginPage;

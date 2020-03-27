import React from 'react';
import PropTypes from 'prop-types';

import config from '../../config';

import Analytics from 'react-router-ga';
import AdobeTracking from './AdobeTracking';
import CookieBox from './CookieBox';

const propTypes = {
  analyticsId: PropTypes.string,
  children: PropTypes.node,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export const CONFIG_NS = 'tracking';
export const TRACKING_STATE_CHOSEN = 'chosen tracking state';
export const TRACKING_STATE_UNCHOSEN = 'not chosen tracking state';

const becomeFalse = (oldVal, newVal) => oldVal && !newVal;

const Tracking = ({
  analyticsId,
  onClose = Function.prototype,
  isOpen,
  children,
}) => {
  const [aaAccepted, setAaAccepted] = React.useState(
    config.getSetting(CONFIG_NS, 'aaAccepted')
  );
  const [gaAccepted, setGaAccepted] = React.useState(
    config.getSetting(CONFIG_NS, 'gaAccepted')
  );

  const saveTrackingLevel = (newValues) => {
    const oldValues = {
      aaAccepted,
      gaAccepted,
    };

    setAaAccepted(newValues.aaAccepted);
    setGaAccepted(newValues.gaAccepted);

    config.setSettings(CONFIG_NS, {
      trackingState: TRACKING_STATE_CHOSEN,
      aaAccepted: newValues.aaAccepted,
      gaAccepted: newValues.gaAccepted,
    });

    // Unload the scripts completely if we have de-selected tracking.
    if (
      becomeFalse(oldValues.aaAccepted, newValues.aaAccepted) ||
      becomeFalse(oldValues.gaAccepted, newValues.gaAccepted)
    ) {
      window.location.reload();
      return;
    }

    onClose();
  };

  return (
    <>
      <CookieBox
        isOpen={isOpen}
        onSubmit={saveTrackingLevel}
        initialAaAccepted={aaAccepted}
        initialGaAccepted={gaAccepted}
      />

      {aaAccepted && <AdobeTracking />}

      {gaAccepted ? (
        <Analytics id={analyticsId}>{children}</Analytics>
      ) : (
        children
      )}
    </>
  );
};

Tracking.propTypes = propTypes;

export default Tracking;

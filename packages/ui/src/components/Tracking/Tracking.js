import React from 'react';
import PropTypes from 'prop-types';

// TODO roll our own analytics as this doesn't clean up after itself.
import Analytics from 'react-router-ga';
import config from '../../config';

import AdobeTracking from './AdobeTracking';
import CookiePopup from './CookiePopup';

export const TRACK_LVL_FULL = 'full tracking';
export const TRACK_LVL_MIN = 'min tracking';
export const TRACK_LVL_NONE = 'no tracking';

export const TRACKING_STATE_CHOSEN = 'chosen tracking state';
export const TRACKING_STATE_UNCHOSEN = 'not chosen tracking state';

class Tracking extends React.Component {
  static namespace = 'tracking';

  state = {
    trackingLevel: config.getSetting(
      Tracking.namespace,
      'trackingLevel',
      TRACK_LVL_NONE
    ),
    trackingState: config.getSetting(
      Tracking.namespace,
      'trackingState',
      TRACKING_STATE_UNCHOSEN
    ),
    popupOpen:
      config.getSetting(Tracking.namespace, 'trackingState') !==
      TRACKING_STATE_CHOSEN,
  };

  saveTrackingLevel(newLevel) {
    config.setSetting(Tracking.namespace, 'trackingLevel', newLevel);
    config.setSetting(
      Tracking.namespace,
      'trackingState',
      TRACKING_STATE_CHOSEN
    );
  }

  trackingLevelChosen = newLevel => {
    this.saveTrackingLevel(newLevel);
    this.setState({
      trackingLevel: newLevel,
      trackingState: TRACKING_STATE_CHOSEN,
      popupOpen: false,
    });
  };

  openCookiePopup = () => {
    this.setState({ popupOpen: true });
  };

  renderTracking() {
    const { analyticsId, children } = this.props;

    if (this.state.trackingLevel === TRACK_LVL_MIN) {
      return <Analytics id={analyticsId}>{children}</Analytics>;
    }

    if (this.state.trackingLevel === TRACK_LVL_FULL) {
      return (
        <>
          <AdobeTracking />
          <Analytics id={analyticsId}>{children}</Analytics>
        </>
      );
    }

    // i.e. trackingLevel === TRACK_LVL_NONE
    return children;
  }

  render() {
    return (
      <>
        <CookiePopup
          open={this.state.popupOpen}
          onChange={this.trackingLevelChosen}
          onOpen={this.openCookiePopup}
          options={[
            [TRACK_LVL_NONE, "Don't track me, just let me find a loo"],
            [TRACK_LVL_MIN, 'Track my page visits and let me find a loo'],
            [
              TRACK_LVL_FULL,
              'Track how I use the website and let me find a loo',
            ],
          ]}
          value={this.state.trackingLevel}
        />
        {this.renderTracking()}
      </>
    );
  }
}

Tracking.propTypes = {
  analyticsId: PropTypes.string,
  children: PropTypes.node,
};

export default Tracking;

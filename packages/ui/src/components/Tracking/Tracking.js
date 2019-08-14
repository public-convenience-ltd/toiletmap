import React from 'react';
import PropTypes from 'prop-types';

import config from '../../config';

import Analytics from 'react-router-ga';
import AdobeTracking from './AdobeTracking';
import CookiePopup from './CookiePopup';

export const TRACK_LVL_FULL = 'full tracking';
export const TRACK_LVL_MIN = 'min tracking';
export const TRACK_LVL_NONE = 'no tracking';

export const TRACKING_STATE_CHOSEN = 'chosen tracking state';
export const TRACKING_STATE_UNCHOSEN = 'not chosen tracking state';

class Tracking extends React.Component {
  static configNS = 'tracking';

  state = {
    trackingLevel: config.getSetting(
      Tracking.configNS,
      'trackingLevel',
      TRACK_LVL_NONE
    ),
    trackingState: config.getSetting(
      Tracking.configNS,
      'trackingState',
      TRACKING_STATE_UNCHOSEN
    ),
  };

  saveTrackingLevel(newLevel) {
    const oldLevel = this.state.trackingLevel;

    config.setSetting(Tracking.configNS, 'trackingLevel', newLevel);
    config.setSetting(
      Tracking.configNS,
      'trackingState',
      TRACKING_STATE_CHOSEN
    );

    // We need to full page reload to remove the analytics script from the DOM
    // TODO: roll our own page tracking which cleans up after it's unmounted
    if (oldLevel !== newLevel && newLevel === TRACK_LVL_NONE) {
      window.location.reload();
    }
  }

  trackingLevelChosen = newLevel => {
    this.saveTrackingLevel(newLevel);
    this.setState({
      trackingLevel: newLevel,
      trackingState: TRACKING_STATE_CHOSEN,
    });

    this.props.onChange(newLevel);
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
          open={this.props.open}
          onChange={this.trackingLevelChosen}
          options={[
            [TRACK_LVL_NONE, "Don't track me"],
            [TRACK_LVL_MIN, 'Track my page visits'],
            [TRACK_LVL_FULL, 'Share with demestos'],
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
  open: PropTypes.bool,
  onChange: PropTypes.func,
};

Tracking.defaultProps = {
  onChange: () => {},
};

export default Tracking;

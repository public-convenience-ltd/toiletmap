import React from 'react';
import PropTypes from 'prop-types';

import config from '../../config';

import Analytics from 'react-router-ga';
import AdobeTracking from './AdobeTracking';
import CookieBox from './CookieBox';

export const TRACK_LVL_FULL = 'full tracking';
export const TRACK_LVL_GA = 'google analytics only tracking';
export const TRACK_LVL_AA = 'adobe analytics only tracking';
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

    if (oldLevel !== newLevel) {
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

    switch (this.state.trackingLevel) {
      case TRACK_LVL_FULL:
        return (
          <>
            <AdobeTracking />
            <Analytics id={analyticsId}>{children}</Analytics>
          </>
        );

      case TRACK_LVL_GA:
        return <Analytics id={analyticsId}>{children}</Analytics>;

      case TRACK_LVL_AA:
        return <AdobeTracking />;

      case TRACK_LVL_NONE:
      default:
        // i.e. trackingLevel === TRACK_LVL_NONE
        return children;
    }
  }

  render() {
    return (
      <>
        <CookieBox
          open={this.props.open}
          onChange={this.trackingLevelChosen}
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

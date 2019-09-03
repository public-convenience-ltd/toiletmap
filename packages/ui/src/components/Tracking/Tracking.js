import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import config from '../../config';

import Analytics from 'react-router-ga';
import AdobeTracking from './AdobeTracking';
import CookieBox from './CookieBox';

export const TRACKING_STATE_CHOSEN = 'chosen tracking state';
export const TRACKING_STATE_UNCHOSEN = 'not chosen tracking state';

const becomeFalse = (oldVal, newVal) => oldVal && !newVal;

class Tracking extends React.Component {
  static configNS = 'tracking';

  state = {
    aaAccepted: config.getSetting(Tracking.configNS, 'aaAccepted'),
    gaAccepted: config.getSetting(Tracking.configNS, 'gaAccepted'),
  };

  saveTrackingLevel = ({ aaAccepted, gaAccepted }) => {
    const oldVals = {
      aaAccepted: this.state.aaAccepted,
      gaAccepted: this.state.gaAccepted,
    };

    this.setState({
      aaAccepted,
      gaAccepted,
    });

    config.setSettings(Tracking.configNS, {
      trackingState: TRACKING_STATE_CHOSEN,
      aaAccepted,
      gaAccepted,
    });

    // Unload the scripts completely if we have de-selected tracking.
    if (
      becomeFalse(oldVals.aaAccepted, aaAccepted) ||
      becomeFalse(oldVals.gaAccepted, gaAccepted)
    ) {
      window.location.reload();
      return;
    }
    this.props.onClose();
  };

  renderTracking() {
    const { analyticsId, children } = this.props;
    const { gaAccepted, aaAccepted } = this.state;

    switch (true) {
      case gaAccepted && aaAccepted:
        return (
          <Fragment>
            <AdobeTracking />
            <Analytics id={analyticsId}>{children}</Analytics>
          </Fragment>
        );

      case gaAccepted:
        return <Analytics id={analyticsId}>{children}</Analytics>;

      case aaAccepted:
        return (
          <Fragment>
            <AdobeTracking />
            {children}
          </Fragment>
        );

      default:
        // i.e. don't track me at all
        return children;
    }
  }

  render() {
    return (
      <>
        <CookieBox
          open={this.props.open}
          onSubmit={this.saveTrackingLevel}
          aaAccepted={this.state.aaAccepted}
          gaAccepted={this.state.gaAccepted}
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
  onClose: PropTypes.func,
};

Tracking.defaultProps = {
  onClose: () => {},
};

export default Tracking;

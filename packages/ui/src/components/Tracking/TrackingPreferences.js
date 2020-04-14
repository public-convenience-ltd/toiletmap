import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import config from '../../config';
import controls from '../../css/controls.module.css';
import styles from '../css/cookie-box.module.css';
import { TRACKING_STORAGE_KEY } from './';

const propTypes = {
  analyticsId: PropTypes.string,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

const PreferenceCheckbox = ({ children, checked, name, onChange }) => (
  <label className={controls.preferenceWrapper}>
    <input
      className={controls.preferenceInput}
      type="checkbox"
      name={name}
      onChange={onChange}
      checked={checked}
    />
    <span className={controls.preference}>{children}</span>
  </label>
);

const TrackingPreferences = ({ onClose = Function.prototype, isOpen }) => {
  const [aaAccepted, setAaAccepted] = React.useState(
    config.getSetting(TRACKING_STORAGE_KEY, 'aaAccepted') || false
  );

  const [gaAccepted, setGaAccepted] = React.useState(
    config.getSetting(TRACKING_STORAGE_KEY, 'gaAccepted') || false
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Set tracking settings in local storage
    config.setSettings(TRACKING_STORAGE_KEY, {
      aaAccepted,
      gaAccepted,
      trackingStateChosen: true,
    });

    // Reload window to allow tracking components to check updated local storage values
    window.location.reload();
  };

  return (
    <div id="tracking-preferences" aria-hidden={!isOpen}>
      {isOpen && (
        <div className={styles.popupBody}>
          <p>
            Opt in to a Google Analytics cookie. This will help us improve your
            experience with the site, so you can find a loo quicker. By opting
            in you would be sharing your data with Public Convenience Ltd and
            tech partners Neontribe as well as Google itself.
          </p>

          <form onSubmit={handleSubmit}>
            <PreferenceCheckbox
              onChange={(evt) => setGaAccepted(evt.target.checked)}
              checked={gaAccepted}
            >
              <span>Opt-in to Google Analytics</span>
            </PreferenceCheckbox>

            {config.shouldShowSponsor() && (
              <>
                <p>
                  You can also opt in to additional cookies to support the
                  project indirectly. By opting in to additional analytics
                  cookies we can share your data with Unilever via Google and
                  Adobe Analytics, and benefit from Unilever's continued
                  sponsorship.
                </p>

                <PreferenceCheckbox
                  onChange={(evt) => setAaAccepted(evt.target.checked)}
                  checked={aaAccepted}
                >
                  <span>Opt-in to Adobe Analytics</span>
                </PreferenceCheckbox>
              </>
            )}

            <p>
              Opting in is entirely up to you. For more detailed information
              about the cookies we use, see our{' '}
              <Link to="/privacy">Cookies page.</Link>
            </p>

            <div>
              <button className={controls.btn}>Save and close</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

TrackingPreferences.propTypes = propTypes;

export default TrackingPreferences;

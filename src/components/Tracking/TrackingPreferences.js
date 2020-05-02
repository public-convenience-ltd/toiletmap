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
  <label className={styles.cookieOption}>
    <input
      className={styles.cookieOptionCheckbox}
      type="checkbox"
      name={name}
      onChange={onChange}
      checked={checked}
    />
    <span className={styles.cookieOptionLabel}>{children}</span>
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
    <aside id="tracking-preferences" aria-hidden={!isOpen}>
      {isOpen && (
        <div className={styles.popupBody}>
          <form onSubmit={handleSubmit}>
            <h1 className={styles.popupHeading}>Cookies and Privacy</h1>

            <p>
              Opting in to Google Analytics will help us improve your experience
              with the site. By opting in you would be sharing your data with
              Public Convenience Ltd, tech partners Neontribe and Google itself.
            </p>

            {config.shouldShowSponsor() && (
              <p>
                Opting in to Adobe Analytcs means we can share your data with
                Unilever and benefit from Unilever's continued sponsorship.
              </p>
            )}

            <p>
              For more detailed information about the cookies we use, see our{' '}
              <Link to="/privacy">privacy policy.</Link>
            </p>

            <div className={styles.cookieOptions}>
              <PreferenceCheckbox
                onChange={(evt) => setGaAccepted(evt.target.checked)}
                checked={gaAccepted}
              >
                <span>Opt-in to Google Analytics</span>
              </PreferenceCheckbox>

              {config.shouldShowSponsor() && (
                <PreferenceCheckbox
                  onChange={(evt) => setAaAccepted(evt.target.checked)}
                  checked={aaAccepted}
                >
                  <span>Opt-in to Adobe Analytics</span>
                </PreferenceCheckbox>
              )}
            </div>

            <input
              type="submit"
              className={controls.btn}
              value="Save and close"
            />
          </form>
        </div>
      )}
    </aside>
  );
};

TrackingPreferences.propTypes = propTypes;

export default TrackingPreferences;

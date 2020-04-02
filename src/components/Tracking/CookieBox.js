import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import styles from '../css/cookie-box.module.css';
import controls from '../../css/controls.module.css';
import config from '../../config';

const propTypes = {
  initialAaAccepted: PropTypes.bool,
  initialGaAccepted: PropTypes.bool,
  isOpen: PropTypes.bool,
  onSubmit: PropTypes.func,
};

// Copy/pasted from pages/PreferencesPage.js.
// TODO: Abstract this is we see this pattern any more times.
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

const CookieBox = ({
  initialAaAccepted,
  initialGaAccepted,
  isOpen,
  onSubmit = Function.prototype,
}) => {
  const [aaAccepted, setAaAccepted] = React.useState(
    initialAaAccepted || false
  );
  const [gaAccepted, setGaAccepted] = React.useState(
    initialGaAccepted || false
  );

  const handleSubmit = (evt) => {
    evt.preventDefault();

    onSubmit({
      aaAccepted,
      gaAccepted,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div>
      <div className={styles.popupBody}>
        <p>
          Opt in to a Google Analytics cookie. This will help us improve your
          experience with the site, so you can find a loo quicker. By opting in
          you would be sharing your data with Public Convenience Ltd and tech
          partners Neontribe as well as Google itself.
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
                You can also opt in to additional cookies to support the project
                indirectly. By opting in to additional analytics cookies we can
                share your data with Unilever via Google and Adobe Analytics,
                and benefit from Unilever's continued sponsorship.
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
            Opting in is entirely up to you. For more detailed information about
            the cookies we use, see our <Link to="/privacy">Cookies page.</Link>
          </p>

          <div>
            <button className={controls.btn}>Save and close</button>
          </div>
        </form>
      </div>
    </div>
  );
};

CookieBox.propTypes = propTypes;

export default CookieBox;

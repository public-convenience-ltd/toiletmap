import React, { useState } from 'react';

import config, { PREFERENCES_KEY } from '../config';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';
import DismissableBox from '../components/DismissableBox';
import Notification from '../components/Notification';

import styles from './css/preferences-page.module.css';
import layout from '../components/css/layout.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import accessibleIcon from '../images/pref-accessible.svg';
import freeIcon from '../images/pref-cost.svg';
import openIcon from '../images/pref-open.svg';
import maleIcon from '../images/pref-male.svg';
import femaleIcon from '../images/pref-female.svg';
import babychangingIcon from '../images/pref-babychanging.svg';

const preferenceMap = [
  {
    name: 'free',
    image: freeIcon,
    label: 'Free',
  },
  {
    name: 'accessible',
    image: accessibleIcon,
    label: 'Accessible',
  },
  {
    name: 'open',
    image: openIcon,
    label: 'Open Now',
  },
  {
    name: 'male',
    image: maleIcon,
    label: 'Male',
  },
  {
    name: 'female',
    image: femaleIcon,
    label: 'Female',
  },
  {
    name: 'babychanging',
    image: babychangingIcon,
    label: 'Baby Changing',
  },
];

const PreferencesPage = (props) => {
  const [unsavedPreferences, setUnsavedPreferences] = useState({});
  const [savedPreferences] = useState(config.getSettings(PREFERENCES_KEY));
  const [updated, setUpdated] = useState(false);

  const updateSelection = (event) => {
    // Fallback to `undefined` instead of `false` so we unset the data as opposed to
    // storing a non-truthy value
    var newVal = event.target.checked || undefined;

    // Update state using React's immutable helper addon
    setUnsavedPreferences({
      ...unsavedPreferences,
      [event.target.name]: newVal,
    });

    setUpdated(false);
  };

  const save = () => {
    // `Object.assign` to avoid potentially state mutation
    var preferences = Object.assign({}, unsavedPreferences);

    for (let key in preferences) {
      if (preferences.hasOwnProperty(key)) {
        config.setSetting(PREFERENCES_KEY, key, preferences[key]);
      }
    }

    // Reset unsaved preferences collection
    setUnsavedPreferences({});
    setUpdated(true);
  };

  const isDirty = () => {
    return Object.keys(unsavedPreferences).length !== 0;
  };

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

      <DismissableBox
        persistKey="preferences-intro"
        title="Preferences"
        content={
          <>
            Highlight toilet features that matter to you. Toilets with these
            features will be indicated for you. Toilets lacking crucial features
            will appear in red.
          </>
        }
      />

      <h2 className={headings.large}>My Toilet Preferences</h2>

      <div className={styles.preferences}>
        {/* This checkbox style is also used in the CookieBox component. */}
        {preferenceMap.map((preference) => (
          <label key={preference.name} className={controls.preferenceWrapper}>
            <input
              className={controls.preferenceInput}
              type="checkbox"
              name={preference.name}
              onChange={updateSelection}
              defaultChecked={savedPreferences[preference.name]}
            />
            <span className={controls.preference}>
              <img
                alt={preference.name}
                className={controls.preferenceImage}
                src={preference.image}
              />
              <span>{preference.label}</span>
            </span>
          </label>
        ))}
      </div>

      {updated && (
        <Notification>
          <h3 className={helpers.visuallyHidden}>Saved</h3>
          <p>Your preferences have been updated.</p>
        </Notification>
      )}

      <button className={controls.btn} onClick={save} disabled={!isDirty()}>
        Save
      </button>
    </div>
  );

  return <PageLayout main={mainFragment} map={<NearestLooMap />} />;
};

export default PreferencesPage;

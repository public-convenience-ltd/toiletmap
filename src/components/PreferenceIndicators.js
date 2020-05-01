import React from 'react';
import PropTypes from 'prop-types';

import config from '../config.js';

import styles from './css/preference-indicators.module.css';

import accessibleIcon from '../images/pref-accessible-white.svg';
import costIcon from '../images/pref-cost-white.svg';
import openIcon from '../images/pref-open-white.svg';
import maleIcon from '../images/pref-male-white.svg';
import femaleIcon from '../images/pref-female-white.svg';
import babychangingIcon from '../images/pref-babychanging-white.svg';

const propTypes = {
  // The loo instance to compare the user's preferences against
  loo: PropTypes.object.isRequired,
  // Icon size multiplier (based on 1rem)
  iconSize: PropTypes.number,
};

const ICONS = {
  accessible: accessibleIcon,
  free: costIcon,
  open: openIcon,
  male: maleIcon,
  female: femaleIcon,
  babychanging: babychangingIcon,
};

const PreferenceIndicators = ({ loo, iconSize = 1 }) => {
  const comparison = config.checkPreferences(loo);

  return (
    <div className={styles.preferenceIndicators}>
      {Object.keys(comparison).map((preference, index) => {
        const value = comparison[preference];

        return [true, false].indexOf(value) !== -1 ? (
          <img
            alt={preference}
            key={index}
            src={ICONS[preference]}
            className={
              value
                ? styles.preferenceIndicatorYes
                : styles.preferenceIndicatorNo
            }
            style={{
              height: `${iconSize}rem`,
              width: `${iconSize}rem`,
            }}
          />
        ) : null;
      })}
    </div>
  );
};

PreferenceIndicators.propTypes = propTypes;

export default PreferenceIndicators;

import React, { Component } from 'react';
import { connect } from 'react-redux';

import config, { PREFERENCES_KEY } from '../config';

/* Note this approach will be deprecated in the future */
import update from 'react-addons-update';

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

class PreferencesPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unsavedPreferences: {},
      savedPreferences: config.getSettings(PREFERENCES_KEY),
    };

    this.preferenceMap = [
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

    this.save = this.save.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
  }

  updateSelection(event) {
    // Fallback to `undefined` instead of `false` so we unset the data as opposed to
    // storing a non-truthy value
    var newVal = event.target.checked || undefined;

    // Update state using React's immutable helper addon
    var newState = update(this.state, {
      unsavedPreferences: {
        [event.target.name]: { $set: newVal },
      },

      // Reset updated state until `save` is called
      updated: { $set: false },
    });

    this.setState(newState);
  }

  save() {
    // `Object.assign` to avoid potentially state mutation
    var preferences = Object.assign({}, this.state.unsavedPreferences);

    for (let key in preferences) {
      if (preferences.hasOwnProperty(key)) {
        config.setSetting(PREFERENCES_KEY, key, preferences[key]);
      }
    }

    // Reset unsaved preferences collection
    this.setState({
      unsavedPreferences: {},
      updated: true,
    });
  }

  renderMain() {
    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button
                onClick={this.props.history.goBack}
                className={controls.btn}
              >
                Back
              </button>
            )}
          </div>
        </div>

        <DismissableBox
          persistKey="preferences-intro"
          title="Preferences"
          content={`Highlight toilet features that matter to you. Toilets with these
                        features will be indicated for you. Toilets lacking crucial features will
                        appear in red.`}
        />

        <h2 className={headings.large}>My Toilet Preferences</h2>

        <div className={styles.preferences}>
          {this.preferenceMap.map(preference => (
            <label key={preference.name} className={controls.preferenceWrapper}>
              <input
                className={controls.preferenceInput}
                type="checkbox"
                name={preference.name}
                onChange={this.updateSelection}
                defaultChecked={this.state.savedPreferences[preference.name]}
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

        {this.state.updated && (
          <Notification>
            <h3 className={helpers.visuallyHidden}>Saved</h3>
            <p>Your preferences have been updated.</p>
          </Notification>
        )}

        <button className={controls.btn} onClick={this.save}>
          Save
        </button>
      </div>
    );
  }

  renderMap() {
    return <NearestLooMap />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PreferencesPage);

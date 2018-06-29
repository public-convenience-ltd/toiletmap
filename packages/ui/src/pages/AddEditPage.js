import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import history from '../history';

import AddEditLooMap from '../components/map/AddEditLooMap';
import DismissableBox from '../components/DismissableBox';
import Notification from '../components/Notification';

import { actionReportRequest } from '../redux/modules/loos';

import config from '../config';

import styles from './css/edit-loo-page.module.css';
import layout from '../components/css/layout.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

class AddEditPage extends Component {
  questionnaireMap = [
    {
      question: 'Attended?',
      property: 'attended',
    },
    {
      question: 'Baby changing?',
      property: 'babyChange',
    },
    {
      question: 'Automatic?',
      property: 'automatic',
    },
    {
      question: 'Radar key?',
      property: 'radar',
    },
  ];

  optionsMap = {
    opening: [
      {
        name: '24/7',
        value: '24/7',
      },
      {
        name: 'Business hours, Mon-Sun',
        value: '09:00-17:00',
      },
      {
        name: 'Business hours, Mon-Fri',
        value: 'Mo-Fr 09:00-17:00',
      },
      {
        name: 'Evening only',
        value: '17:00-00:00',
      },
      {
        name: 'Daylight hours only',
        value: '09:00-18:00',
      },
      {
        name: 'Other',
        value: '',
      },
    ],
    type: [
      {
        name: 'Female',
        value: 'female',
      },
      {
        name: 'Male',
        value: 'male',
      },
      {
        name: 'Female and Male',
        value: 'female and male',
      },
      {
        name: 'Unisex',
        value: 'unisex',
      },
      {
        name: 'Male Urinal',
        value: 'male urinal',
      },
      {
        name: 'Children Only',
        value: 'children only',
      },
      {
        name: 'None',
        value: 'none',
      },
    ],
    access: [
      {
        name: 'Public',
        value: 'public',
      },
      {
        name: 'Non-customers permitted',
        value: 'permissive',
      },
      {
        name: 'Customers only',
        value: 'customers only',
      },
    ],
  };

  constructor(props) {
    super(props);

    var state = {
      // Storing a local copy of the loo allows us to keep track of any changes.
      // Skeleton loo structure required to track state.
      loo: {
        properties: {
          name: '',
          access: '',
          type: '',
          accessibleType: '',
          opening: '',
          notes: '',
          fee: '',
        },
      },
    };

    // Set questionnaire loo property defaults
    this.questionnaireMap.forEach(q => {
      state.loo.properties[q.property] = '';
    });

    // Deep extend loo state to ensure we get all properties (since we can't guarantee
    // that `this.props.loo` will include them all)
    state.loo = _.merge({}, state.loo, this.props.loo);

    // Set initial internal state
    this.state = state;

    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  handleChange(event) {
    // `Object.assign` to avoid state mutation
    var loo = Object.assign({}, this.state.loo);

    // Sets nested loo property value
    _.set(loo, event.target.name, event.target.value);

    this.setState({
      loo,
    });
  }

  save() {
    // `Object.assign` to avoid state mutation
    var loo = Object.assign({}, this.state.loo);

    loo.geometry = {
      type: 'Point',
      coordinates: [this.props.map.center.lng, this.props.map.center.lat],
    };

    this.props.actionReportRequest(loo);
  }

  renderMobileMap() {
    return (
      <div className={styles.mobileMap}>
        <AddEditLooMap
          looMapProps={{
            showSearchControl: false,
          }}
        />
      </div>
    );
  }

  render() {
    var loo = this.state.loo;

    // Default center coordinates to the user's location:
    // this will be the case when a loo has not been provided to edit
    var center = this.props.geolocation.position;

    // Preferably, use the maps center coordinates:
    // these will default to the loo position if a loo has been provided
    if (this.props.map.center) {
      center = this.props.map.center;
    }

    return (
      <div>
        <div>
          <div className={layout.controls}>
            <button onClick={history.goBack} className={controls.btn}>
              Back
            </button>
          </div>
        </div>

        {this.props.loo ? (
          <h2 className={headings.large}>Update This Loo</h2>
        ) : (
          <h2 className={headings.large}>Add This Loo</h2>
        )}

        <MediaQuery maxWidth={config.viewport.mobile}>
          {this.renderMobileMap()}
        </MediaQuery>

        <Notification>
          <p>Align the crosshair with where you believe the loo to be.</p>
        </Notification>

        <DismissableBox
          persistKey="edit-welcome"
          title="Welcome Contributor!"
          content="Please fill in everything you can about the loo below."
        />

        <label>
          Loo name
          <input
            name="properties.name"
            type="text"
            className={controls.text}
            value={loo.properties.name === null ? '' : loo.properties.name}
            onChange={this.handleChange}
          />
        </label>

        <label>
          Who can access?
          <select
            name="properties.access"
            className={controls.dropdown}
            value={loo.properties.access === null ? '' : loo.properties.access}
            onChange={this.handleChange}
          >
            <option value="">Unknown</option>
            {this.optionsMap.access.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Facilities
          <select
            name="properties.type"
            className={controls.dropdown}
            value={loo.properties.type === null ? '' : loo.properties.type}
            onChange={this.handleChange}
          >
            <option value="">Unknown</option>
            {this.optionsMap.type.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Accessible facilities
          <select
            name="properties.accessibleType"
            className={controls.dropdown}
            value={
              loo.properties.accessibleType === null
                ? ''
                : loo.properties.accessibleType
            }
            onChange={this.handleChange}
          >
            <option value="">Unknown</option>
            {this.optionsMap.type.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Opening hours
          <select
            name="properties.opening"
            className={controls.dropdown}
            value={
              loo.properties.opening === null ? '' : loo.properties.opening
            }
            onChange={this.handleChange}
          >
            <option value="">Unknown</option>
            {this.optionsMap.opening.map((option, index) => (
              <option key={index} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.questionnaire}>
          <div>
            <span className={styles.questionnaireCol} />
            <span className={styles.questionnaireCol} id="yes">
              Yes
            </span>
            <span className={styles.questionnaireCol} id="no">
              No
            </span>
            <span className={styles.questionnaireCol} id="unknown">
              Don't know
            </span>
          </div>

          {this.questionnaireMap.map((q, index) => (
            <fieldset key={index} className={styles.questionnaireGroup}>
              <legend className={helpers.visuallyHidden}>{q.question}</legend>
              <span className={styles.questionnaireCol}>{q.question}</span>
              <input
                name={`properties.${q.property}`}
                className={styles.questionnaireCol}
                type="radio"
                value="true"
                aria-labelledby="yes"
                checked={loo.properties[q.property] === 'true'}
                onChange={this.handleChange}
              />
              <input
                name={`properties.${q.property}`}
                className={styles.questionnaireCol}
                type="radio"
                value="false"
                aria-labelledby="no"
                checked={loo.properties[q.property] === 'false'}
                onChange={this.handleChange}
              />
              <input
                name={`properties.${q.property}`}
                className={styles.questionnaireCol}
                type="radio"
                value="Not Known"
                aria-labelledby="unknown"
                checked={
                  ['true', 'false'].indexOf(loo.properties[q.property]) === -1
                }
                onChange={this.handleChange}
              />
            </fieldset>
          ))}
        </div>

        <label>
          Fee?
          <input
            name="properties.fee"
            type="text"
            className={controls.text}
            value={loo.properties.fee === null ? '' : loo.properties.fee}
            placeholder="The amount e.g. £0.10"
            onChange={this.handleChange}
          />
        </label>

        <label>
          Any notes?
          <textarea
            name="properties.notes"
            className={controls.text}
            value={loo.properties.notes === null ? '' : loo.properties.notes}
            onChange={this.handleChange}
          />
        </label>

        <h3 className={headings.regular}>Data for this loo</h3>

        <div className={styles.data}>
          <label>
            Latitude
            <input
              type="text"
              name="geometry.coordinates.0"
              className={controls.text}
              value={center.lat}
              readOnly={true}
            />
          </label>

          <label>
            Longitude
            <input
              type="text"
              name="geometry.coordinates.1"
              className={controls.text}
              value={center.lng}
              readOnly={true}
            />
          </label>
        </div>

        <div className={controls.btnStack}>
          {this.props.loo ? (
            <input
              type="submit"
              className={controls.btn}
              onClick={this.save}
              value="Update the toilet"
            />
          ) : (
            <input
              type="submit"
              className={controls.btn}
              onClick={this.save}
              value="Add the toilet"
            />
          )}

          {this.props.loo && (
            <Link
              to={`/loos/${this.props.loo._id}/remove`}
              className={controls.btnCaution}
            >
              Remove the toilet
            </Link>
          )}
        </div>
      </div>
    );
  }
}

AddEditPage.propTypes = {
  // If provided, the form will be in 'edit' mode and populated against the loo instance.
  // The absence of a loo results in the form being in 'add' mode.
  loo: PropTypes.object,
};

var mapStateToProps = state => ({
  app: state.app,
  map: state.mapAddEdit,
  geolocation: state.geolocation,
});

var mapDispatchToProps = {
  actionReportRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditPage);

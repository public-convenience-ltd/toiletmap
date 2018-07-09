import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import NearestLooMap from '../components/NearestLooMap';
import DismissableBox from '../components/DismissableBox';
import Notification from '../components/Notification';

import {
  actionReportRequest,
  actionFindByIdRequest,
} from '../redux/modules/loos';

import { actionHighlight } from '../redux/modules/mapControls';

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

  optionsMap = config.looProps.definitions;

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

    // Keep track of defaults so we only submit new information
    state.originalData = _.cloneDeep(state.loo);
    state.originalCenter = this.getCenter();

    // Set initial internal state
    this.state = state;

    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
  }

  componentDidMount() {
    // If our url contains a loo id and we don't have the data, ask for it
    if (this.props.match.params.id) {
      if (!this.props.loo) {
        this.props.actionFindByIdRequest(this.props.match.params.id);
      }
      this.props.actionHighlight(this.props.match.params.id);
    }
  }

  componentWillUnmount() {
    // Clear any marker highlighting when navigating away
    this.props.actionHighlight(null);
  }

  handleChange(event) {
    // Avoid state mutation
    var loo = _.cloneDeep(this.state.loo);

    // Sets nested loo property value
    _.set(loo, event.target.name, event.target.value);

    this.setState({
      loo,
    });
  }

  isDerived() {
    // Presenve of this.props.loo indicates that we are editing
    // Conditional expression converts truthy/falsey to boolean
    return this.props.loo ? true : false;
  }

  getNovelInput() {
    const before = _.cloneDeep(this.state.originalData);
    const now = _.cloneDeep(this.state.loo);

    // Add geometry
    before.geometry = {
      type: 'Point',
      coordinates: [
        this.state.originalCenter.lng,
        this.state.originalCenter.lat,
      ],
    };
    now.geometry = {
      type: 'Point',
      coordinates: [this.getCenter().lng, this.getCenter().lat],
    };

    // Keep only new or changed data, by comparing to the form's initial state
    const changes = onlyChanges(now, before);

    if (!this.isDerived()) {
      // If we're a new loo, we always want geometry, regardless of whether it
      // has changed since the start of the form
      changes.geometry = now.geometry;
    }

    return changes;
  }

  getCenter() {
    // Preferably, use the maps center coordinates:
    // these will default to the loo position if a loo has been provided
    if (this.props.map.center) {
      return this.props.map.center;
    }

    // Else default center coordinates to the user's location:
    // this will be the case when a loo has not been provided to edit
    // e.g. the user has directly navigated to /report
    return this.props.geolocation.position;
  }

  save() {
    const changes = this.getNovelInput();

    // Only submit if we've got something to tell
    if (_.isEmpty(changes)) {
      return;
    }

    // Always associate geometry with a report, even if unchanged
    changes.geometry = {
      type: 'Point',
      coordinates: [this.getCenter().lng, this.getCenter().lat],
    };

    // Show that this report is a derivation of a previous loo
    if (this.isDerived()) {
      changes.derivedFrom = this.props.loo._id;
    }

    this.props.actionReportRequest(changes);
  }

  renderMain() {
    const loo = this.state.loo;
    const center = this.getCenter();

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

        {this.isDerived() ? (
          <h2 className={headings.large}>Update This Loo</h2>
        ) : (
          <h2 className={headings.large}>Add This Loo</h2>
        )}

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{this.renderMap()}</div>
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
          {this.isDerived() ? (
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

          {this.isDerived() && (
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

  renderMap() {
    return (
      <NearestLooMap
        loo={this.props.loo}
        highlight
        mapProps={{
          showLocation: false,
          showSearchControl: false,
          showLocateControl: false,
          showCenter: false,
          preventDragging: false,
          minZoom: config.initialZoom,
          showCrosshair: true,
        }}
      />
    );
  }

  render() {
    if (this.props.match.params.id && !this.props.loo) {
      return (
        <PageLayout
          main={<Loading message={'Fetching Loo Data'} />}
          map={<Loading message={'Fetching Loo Data'} />}
        />
      );
    }
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

AddEditPage.propTypes = {
  // If provided, the form will be in 'edit' mode and populated against the loo instance.
  // The absence of a loo results in the form being in 'add' mode.
  loo: PropTypes.object,
};

/**
 * Only keep fields in loo that are different to their corresponding field in
 * from.
 *
 * This is used to only submit novel or differing information in reports.
 */
function onlyChanges(loo, from) {
  return _.transform(loo, (acc, value, key) => {
    if (_.isObject(value)) {
      // Deeply compare
      const nestedChanges = onlyChanges(value, from[key]);
      if (!_.isEmpty(nestedChanges)) {
        acc[key] = nestedChanges;
      }
    } else if (value !== from[key]) {
      // Only keep a value in loo if it is changed
      acc[key] = value;
    }
  });
}

var mapStateToProps = (state, ownProps) => ({
  app: state.app,
  map: state.mapControls,
  geolocation: state.geolocation,
  loo: state.loos.byId[ownProps.match.params.id] || null,
});

var mapDispatchToProps = {
  actionReportRequest,
  actionFindByIdRequest,
  actionHighlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditPage);

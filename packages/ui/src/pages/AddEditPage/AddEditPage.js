import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import { mappings } from '@toiletmap/api-client';

import config from '../../config';

import Button from '../../design-system/src/components/Button';
import LinkButton from '../../design-system/src/components/LinkButton';
import Group from '../../design-system/src/components/Group';
import Heading from '../../design-system/src/components/Heading';
import DismissibleBox from '../../design-system/src/components/DismissibleBox';
import Notification from '../../design-system/src/components/Notification';
import VerticalSpacing from '../../design-system/src/components/VerticalSpacing';
import VisuallyHidden from '../../design-system/src/components/VisuallyHidden';

import PageLayout from '../../PageLayout';
import Loading from '../../Loading';
import NearestLooMap from '../../NearestLooMap';

import {
  actionReportRequest,
  actionFindByIdRequest,
} from '../../redux/modules/loos';

import { actionHighlight } from '../../redux/modules/mapControls';

import styles from './EditLooPage.module.css';

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

  optionsMap = mappings.looProps.definitions;

  constructor(props) {
    super(props);

    var state = {
      // Storing a local copy of the loo allows us to keep track of any changes.
      // Skeleton loo structure required to track state.
      loo: {
        active: null,
        name: '',
        access: '',
        type: '',
        accessibleType: '',
        opening: '',
        notes: '',
        fee: '',
      },
    };

    // Set questionnaire loo property defaults
    this.questionnaireMap.forEach(q => {
      state.loo[q.property] = '';
    });

    // Deep extend loo state to ensure we get all properties (since we can't guarantee
    // that `this.props.loo` will include them all)
    state.loo = _.merge({}, state.loo, props.loo ? props.loo.properties : {});

    // Keep track of defaults so we only submit new information
    state.originalData = _.cloneDeep(state.loo);
    state.originalCenter = this.getCenter();

    // Set initial internal state
    this.state = state;

    this.handleChange = this.handleChange.bind(this);
    this.handleTriStateChange = this.handleTriStateChange.bind(this);
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

  handleTriStateChange(event) {
    let val;
    switch (event.target.value) {
      case 'true':
        val = true;
        break;
      case 'false':
        val = false;
        break;
      default:
        val = event.target.value;
    }

    // Avoid state mutation
    var loo = _.cloneDeep(this.state.loo);

    _.set(loo, event.target.name, val);

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

    // Add the active state for which there's no user-faciong form control as yet.
    now.active = true;

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

    // Always associate geometry with a report, even if unchanged
    changes.geometry = {
      type: 'Point',
      coordinates: [this.getCenter().lng, this.getCenter().lat],
    };

    this.props.actionReportRequest(
      changes,
      this.isDerived() ? this.props.loo : undefined
    );
  }

  renderMain() {
    const loo = this.state.loo;
    const center = this.getCenter();

    return (
      <div>
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={this.props.history.goBack}>Back</Button>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Heading headingLevel={2} size="large">
          {this.isDerived() ? 'Update This Toilet' : 'Add This Toilet'}
        </Heading>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{this.renderMap()}</div>
        </MediaQuery>

        <Notification>
          <p>Align the crosshair with where you believe the toilet to be.</p>
        </Notification>
        <VerticalSpacing />

        <DismissibleBox
          persistKey="edit-welcome"
          title="Welcome Contributor!"
          content="Please fill in everything you can about the toilet below."
        />

        <label>
          Toilet name
          <input
            name="name"
            type="text"
            value={loo.name === null ? '' : loo.name}
            onChange={this.handleChange}
            data-testid="toilet-name"
          />
        </label>

        <label>
          Who can access?
          <select
            name="access"
            value={loo.access === null ? '' : loo.access}
            onChange={this.handleChange}
            data-testid="who-can-access"
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
            name="type"
            value={loo.type === null ? '' : loo.type}
            onChange={this.handleChange}
            data-testid="facilities"
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
            name="accessibleType"
            value={loo.accessibleType === null ? '' : loo.accessibleType}
            onChange={this.handleChange}
            data-testid="accessible-facilities"
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
            name="opening"
            value={loo.opening === null ? '' : loo.opening}
            onChange={this.handleChange}
            data-testid="opening-hours"
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
              Dont know
            </span>
          </div>

          {this.questionnaireMap.map((q, index) => (
            <fieldset key={index} className={styles.questionnaireGroup}>
              <VisuallyHidden>
                <legend>{q.question}</legend>
              </VisuallyHidden>
              <span className={styles.questionnaireCol}>{q.question}</span>
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={true}
                aria-labelledby="yes"
                checked={loo[q.property] === true}
                onChange={this.handleTriStateChange}
                data-testid={`${q.property}:yes`}
              />
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={false}
                aria-labelledby="no"
                checked={loo[q.property] === false}
                onChange={this.handleTriStateChange}
                data-testid={`${q.property}:no`}
              />
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value=""
                aria-labelledby="unknown"
                checked={loo[q.property] === ''}
                onChange={this.handleTriStateChange}
                data-testid={`${q.property}:unknown`}
              />
            </fieldset>
          ))}
        </div>

        <label>
          Fee?
          <input
            name="fee"
            type="text"
            value={loo.fee === null ? '' : loo.fee}
            placeholder="The amount e.g. £0.10"
            onChange={this.handleChange}
            data-testid="fee"
          />
        </label>

        <label>
          Any notes?
          <textarea
            name="notes"
            value={loo.notes === null ? '' : loo.notes}
            onChange={this.handleChange}
            data-testid="notes"
          />
        </label>

        <Heading headingLevel={3}>Data for this toilet</Heading>

        <div className={styles.data}>
          <label>
            Latitude
            <input
              type="text"
              name="geometry.coordinates.0"
              value={center.lat}
              readOnly={true}
            />
          </label>

          <label>
            Longitude
            <input
              type="text"
              name="geometry.coordinates.1"
              data-testid="loo-name"
              value={center.lng}
              readOnly={true}
            />
          </label>
        </div>

        <Group>
          {this.isDerived() ? (
            <Button
              htmlType="submit"
              onClick={this.save}
              disabled={_.isEmpty(this.getNovelInput())}
            >
              Update the toilet
            </Button>
          ) : (
            <Button
              htmlType="submit"
              onClick={this.save}
              data-testid="add-the-toilet"
            >
              Add the toilet
            </Button>
          )}

          {this.isDerived() && (
            <LinkButton
              to={`/loos/${this.props.loo._id}/remove`}
              type="caution"
            >
              Remove the toilet
            </LinkButton>
          )}
        </Group>
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
          showSearchControl: true,
          showLocateControl: false,
          preventDragging: false,
          minZoom: config.editMinZoom,
        }}
      />
    );
  }

  render() {
    if (this.props.match.params.id && !this.props.loo) {
      return (
        <PageLayout
          main={<Loading message="Fetching Toilet Data" />}
          map={<Loading message="Fetching Toilet Data" />}
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

var mapStateToProps = (state, ownProps) => {
  let loo = state.loos.byId[ownProps.match.params.id] || null;
  return {
    app: state.app,
    map: state.mapControls,
    geolocation: state.geolocation,
    loo: loo,
    key: loo ? loo._id : 'newLoo',
  };
};

var mapDispatchToProps = {
  actionReportRequest,
  actionFindByIdRequest,
  actionHighlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddEditPage);

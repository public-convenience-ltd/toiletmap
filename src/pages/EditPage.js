import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';

import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import LooMap from '../components/LooMap';
import DismissableBox from '../components/DismissableBox';
import Notification from '../components/Notification';

import config from '../config';
import graphqlMappings from '../graphqlMappings';

import styles from './css/edit-loo-page.module.css';
import layout from '../components/css/layout.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import { useQuery, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import history from '../history';

const FIND_BY_ID = loader('./findLooById.graphql');
const UPDATE_LOO = loader('./updateLoo.graphql');

const getLooCachedId = (looId) => 'Loo:' + looId;

const questionnaireMap = [
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

const EditPage = (props) => {
  const optionsMap = graphqlMappings.looProps.definitions;

  // Find the raw loo data for the given loo
  const { loading: loadingLooData, data: looData, error: looError } = useQuery(
    FIND_BY_ID,
    {
      variables: {
        id: props.match.params.id,
      },
    }
  );

  // A temp state for the map center
  // We don't need to fetch this from the cached map state, because nearestLooMap
  // does that bit itself, and if it changes it'll tell us with the callback. This is just a
  // store for us so that we can send off the location with a loo report.
  const [mapCenter, setMapCenter] = useState();

  // Get the center to use for the loo
  const getCenter = () => mapCenter;

  // LooState is the temporary loo object that hold's the user's representation of the loo
  const [looState, setLooState] = useState();

  // Original is compared against LooState when saving changes
  const [original, setOriginal] = useState();

  useEffect(() => {
    if (!looData) {
      return;
    }

    let looDataToUse = looData.loo;

    let tempLoo = {
      active: null,
      name: '',
      access: '',
      type: '',
      accessibleType: '',
      opening: '',
      notes: '',
      fee: '',
    };

    // Set questionnaire loo property defaults
    questionnaireMap.forEach((q) => {
      tempLoo[q.property] = '';
    });

    // Deep extend loo state to ensure we get all properties (since we can't guarantee
    // that `looData` will include them all)
    let newLoo = _.merge({}, tempLoo, looDataToUse);
    setLooState(newLoo);
    setMapCenter(newLoo.location);

    // Keep track of defaults so we only submit new information
    setOriginal({
      loo: _.cloneDeep(newLoo),
      center: newLoo.location,
    });
  }, [looData]);

  const handleChange = (event) => {
    // Avoid state mutation
    let loo = _.cloneDeep(looState);

    // Sets nested loo property value
    _.set(loo, event.target.name, event.target.value);

    setLooState(loo);
  };

  const handleTriStateChange = (event) => {
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
    var loo = _.cloneDeep(looState);

    _.set(loo, event.target.name, val);

    setLooState(loo);
  };

  const getNovelInput = () => {
    const before = _.cloneDeep(original.loo);
    const now = _.cloneDeep(looState);

    // Add the active state for which there's no user-facing form control as yet.
    now.active = true;

    // Add location
    before.location = {
      lng: original.center.lng,
      lat: original.center.lat,
    };

    let center = getCenter();
    now.location = {
      lng: center.lng,
      lat: center.lat,
    };

    // Keep only new or changed data, by comparing to the form's initial state
    const changes = onlyChanges(now, before);

    return changes;
  };

  const onMapCenterUpdate = ({ center }) => {
    setMapCenter(center);
  };

  const [
    updateLoo,
    { loading: saveLoading, data: saveResponse, error: saveError },
  ] = useMutation(UPDATE_LOO);

  if (saveError) {
    console.error('error saving:', saveError);
  }

  // Redirect to thanks page if successfully made changes
  if (saveResponse && saveResponse.submitReport.code === '200') {
    history.push(`/loos/${saveResponse.submitReport.loo.id}/thanks`);
  }

  const save = () => {
    const changes = getNovelInput();

    // Always associate geometry with a report, even if unchanged
    let center = getCenter();
    changes.location = {
      lng: center.lng,
      lat: center.lat,
    };

    // Set questionnaire options to null before transport.
    questionnaireMap.forEach((q) => {
      if (changes[q.property] === '') changes[q.property] = null;
    });

    let id = looData.loo.id;
    changes.id = id;

    // Evict the loo from the cache before updating - Apollo
    // is normally smart and can work out when something's changed, but
    // in this case it doesn't and stale data can persist without
    // a cache eviction
    let cache = props.cache;
    cache.evict(getLooCachedId(id));

    updateLoo({
      variables: changes,
    });
  };

  const renderMain = () => {
    const loo = looState;
    const center = getCenter();

    return (
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

        <h2 className={headings.large}>Update This Toilet</h2>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{renderMap()}</div>
        </MediaQuery>

        <Notification>
          <p>Align the crosshair with where you believe the toilet to be.</p>
        </Notification>

        <DismissableBox
          persistKey="edit-welcome"
          title="Welcome Contributor!"
          content="Please fill in everything you can about the toilet below."
        />

        <label>
          Toilet name
          <input
            name="name"
            type="text"
            className={controls.text}
            value={loo.name === null ? '' : loo.name}
            onChange={handleChange}
            data-testid="toilet-name"
          />
        </label>

        <label>
          Who can access?
          <select
            name="access"
            className={controls.dropdown}
            value={loo.access === null ? '' : loo.access}
            onChange={handleChange}
            data-testid="who-can-access"
          >
            <option value="">Unknown</option>
            {optionsMap.access.map((option, index) => (
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
            className={controls.dropdown}
            value={loo.type === null ? '' : loo.type}
            onChange={handleChange}
            data-testid="facilities"
          >
            <option value="">Unknown</option>
            {optionsMap.type.map((option, index) => (
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
            className={controls.dropdown}
            value={loo.accessibleType === null ? '' : loo.accessibleType}
            onChange={handleChange}
            data-testid="accessible-facilities"
          >
            <option value="">Unknown</option>
            {optionsMap.type.map((option, index) => (
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
            className={controls.dropdown}
            value={loo.opening === null ? '' : loo.opening}
            onChange={handleChange}
            data-testid="opening-hours"
          >
            <option value="">Unknown</option>
            {optionsMap.opening.map((option, index) => (
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

          {questionnaireMap.map((q, index) => (
            <fieldset key={index} className={styles.questionnaireGroup}>
              <legend className={helpers.visuallyHidden}>{q.question}</legend>
              <span className={styles.questionnaireCol}>{q.question}</span>
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={true}
                aria-labelledby="yes"
                checked={loo[q.property] === true}
                onChange={handleTriStateChange}
                data-testid={`${q.property}:yes`}
              />
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={false}
                aria-labelledby="no"
                checked={loo[q.property] === false}
                onChange={handleTriStateChange}
                data-testid={`${q.property}:no`}
              />
              <input
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value=""
                aria-labelledby="unknown"
                checked={loo[q.property] === ''}
                onChange={handleTriStateChange}
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
            className={controls.text}
            value={loo.fee === null ? '' : loo.fee}
            placeholder="The amount e.g. £0.10"
            onChange={handleChange}
            data-testid="fee"
          />
        </label>

        <label>
          Any notes?
          <textarea
            name="notes"
            className={controls.text}
            value={loo.notes === null ? '' : loo.notes}
            onChange={handleChange}
            data-testid="notes"
          />
        </label>

        <h3 className={headings.regular}>Data for this toilet</h3>

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
              data-testid="loo-name"
              value={center.lng}
              readOnly={true}
            />
          </label>
        </div>

        {saveLoading && <Loading message={'Saving your changes...'} />}

        {
          // This message probably won't be seen, but just in case the redirect fails...
          saveResponse && saveResponse.submitReport.code === '200' && (
            <Notification>
              Successfully saved changes! Redirecting&hellip;
            </Notification>
          )
        }

        {
          // TODO better error message?
          (saveError ||
            (saveResponse && saveResponse.submitReport.code !== '200')) && (
            <Notification>
              Oops, there was an error saving your changes.
              {console.log(saveError, saveResponse)}
            </Notification>
          )
        }

        <div className={controls.btnStack}>
          <input
            type="submit"
            className={controls.btn}
            onClick={save}
            value="Update the toilet"
            disabled={_.isEmpty(getNovelInput())}
          />

          <Link
            to={`/loos/${props.match.params.id}/remove`}
            className={controls.btnCaution}
          >
            Remove the toilet
          </Link>
        </div>
      </div>
    );
  };

  const renderMap = () => {
    return (
      <LooMap
        loos={
          looData
            ? [looData.loo].map((loo) => ({
                ...loo,
                isHighlighted: true,
              }))
            : []
        }
        center={getCenter()}
        minZoom={config.editMinZoom}
        onMoveEnd={onMapCenterUpdate}
        showCenter
        showSearchControl
      />
    );
  };

  if (loadingLooData || !looData || !looState) {
    return (
      <PageLayout
        main={<Loading message={'Fetching Toilet Data'} />}
        map={<Loading message={'Fetching Toilet Data'} />}
      />
    );
  }

  if (looError) {
    console.error(looError);
    return (
      <PageLayout
        main={<Loading message={'Error fetching toilet data'} />}
        map={<Loading message={'Error fetching toilet data'} />}
      />
    );
  }

  // Redirect to index if loo is not active (i.e. removed)
  if (looData && !looData.loo.active) {
    history.push(`/`);
  }

  return <PageLayout main={renderMain()} map={renderMap()} />;
};

EditPage.propTypes = {
  cache: PropTypes.object,
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

export default EditPage;

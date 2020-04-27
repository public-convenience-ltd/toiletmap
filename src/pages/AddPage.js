import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import MediaQuery from 'react-responsive';
import queryString from 'query-string';

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

import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import history from '../history';
import useMapPosition from '../components/useMapPosition';

const UPDATE_LOO = loader('./updateLoo.graphql');

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

const getInitialLooState = () => {
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

  return tempLoo;
};

const AddPage = (props) => {
  const optionsMap = graphqlMappings.looProps.definitions;

  const [mapPosition, setMapPosition] = useMapPosition();

  const { lat, lng } = queryString.parse(props.location.search);

  React.useEffect(() => {
    setMapPosition({
      center: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });
  }, [lat, lng, setMapPosition]);

  // LooState is the temporary loo object that hold's the user's representation of the loo
  const [looState, setLooState] = useState(getInitialLooState());

  const handleChange = (event) => {
    setLooState({
      ...looState,
      [event.target.name]: event.target.value,
    });
  };

  const handleTriStateChange = (event) => {
    const getEventValue = () => {
      const eventValue = event.target.value;

      if (eventValue === 'true') {
        return true;
      }

      if (eventValue === 'false') {
        return false;
      }

      return eventValue;
    };

    setLooState({
      ...looState,
      [event.target.name]: getEventValue(),
    });
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
    const changes = {
      ...looState,
    };

    // Add the active state for which there's no user-facing form control as yet.
    changes.active = true;

    // Always associate geometry with a report, even if unchanged
    let center = mapPosition.center;

    changes.location = {
      lng: center.lng,
      lat: center.lat,
    };

    // Set questionnaire options to null before transport.
    questionnaireMap.forEach((q) => {
      if (changes[q.property] === '') changes[q.property] = null;
    });

    updateLoo({
      variables: changes,
    });
  };

  const renderMain = () => {
    const loo = looState;
    const center = mapPosition.center;

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

        <h2 className={headings.large}>Add This Toilet</h2>

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
            value="Add the toilet"
            data-testid="add-the-toilet"
          />
        </div>
      </div>
    );
  };

  const renderMap = () => {
    return (
      <LooMap
        center={mapPosition.center}
        minZoom={config.editMinZoom}
        onMoveEnd={setMapPosition}
        showCenter
        showSearchControl
      />
    );
  };

  return <PageLayout main={renderMain()} map={renderMap()} />;
};

AddPage.propTypes = {
  cache: PropTypes.object,
};

export default AddPage;

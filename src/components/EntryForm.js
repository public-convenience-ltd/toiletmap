import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import { useForm } from 'react-hook-form';
import isFunction from 'lodash/isFunction';
import omit from 'lodash/omit';

import layout from '../components/css/layout.module.css';
import styles from '../pages/css/edit-loo-page.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import config from '../config';
import history from '../history';

import Loading from '../components/Loading';
import DismissableBox from './DismissableBox';
import Notification from './Notification';

const EntryForm = ({
  map,
  loo,
  center,
  questionnaireMap,
  optionsMap,
  saveResponse,
  saveError,
  children,
  ...props
}) => {
  const { register, handleSubmit, formState, setValue } = useForm();

  // read the formState before render to subscribe the form state through Proxy
  const { dirtyFields } = formState;

  const onSubmit = (data) => {
    // transform questionnaire data
    questionnaireMap.forEach((q) => {
      const value = data[q.property];

      if (value === 'true') {
        data[q.property] = true;
      } else if (value === 'false') {
        data[q.property] = false;
      } else if (value === '') {
        data[q.property] = null;
      }
    });

    // map geometry data to expected structure
    data.location = {
      lat: parseFloat(data.geometry.coordinates[0]),
      lng: parseFloat(data.geometry.coordinates[1]),
    };

    data = omit(data, 'geometry');

    props.onSubmit(data, dirtyFields);
  };

  useEffect(() => {
    // readonly fields won't fire a change event
    // setValue ensures that the fields will be marked as dirty
    setValue('geometry.coordinates.0', center.lat);
    setValue('geometry.coordinates.1', center.lng);
  }, [center, setValue]);

  return (
    <div>
      <div className={layout.controls}>
        {config.showBackButtons && (
          <button
            type="button"
            onClick={history.goBack}
            className={controls.btn}
          >
            Back
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2 className={headings.large}>Add This Toilet</h2>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{map}</div>
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
            ref={register}
            name="name"
            type="text"
            className={controls.text}
            defaultValue={loo.name === null ? '' : loo.name}
            data-testid="toilet-name"
          />
        </label>

        <label>
          Who can access?
          <select
            ref={register}
            name="access"
            className={controls.dropdown}
            defaultValue={loo.access === null ? '' : loo.access}
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
            ref={register}
            name="type"
            className={controls.dropdown}
            defaultValue={loo.type === null ? '' : loo.type}
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
            ref={register}
            name="accessibleType"
            className={controls.dropdown}
            defaultValue={loo.accessibleType === null ? '' : loo.accessibleType}
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
            ref={register}
            name="opening"
            className={controls.dropdown}
            defaultValue={loo.opening === null ? '' : loo.opening}
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
                ref={register}
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={true}
                aria-labelledby="yes"
                defaultChecked={loo[q.property] === true}
                data-testid={`${q.property}:yes`}
              />

              <input
                ref={register}
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value={false}
                aria-labelledby="no"
                defaultChecked={loo[q.property] === false}
                data-testid={`${q.property}:no`}
              />

              <input
                ref={register}
                name={q.property}
                className={styles.questionnaireCol}
                type="radio"
                value=""
                aria-labelledby="unknown"
                defaultChecked={loo[q.property] === ''}
                data-testid={`${q.property}:unknown`}
              />
            </fieldset>
          ))}
        </div>

        <label>
          Fee?
          <input
            ref={register}
            name="fee"
            type="text"
            className={controls.text}
            defaultValue={loo.fee === null ? '' : loo.fee}
            placeholder="The amount e.g. £0.10"
            data-testid="fee"
          />
        </label>

        <label>
          Any notes?
          <textarea
            ref={register}
            name="notes"
            className={controls.text}
            defaultValue={loo.notes === null ? '' : loo.notes}
            data-testid="notes"
          />
        </label>

        <h3 className={headings.regular}>Data for this toilet</h3>

        <div className={styles.data}>
          <label>
            Latitude
            <input
              ref={register}
              type="text"
              name="geometry.coordinates.0"
              className={controls.text}
              value={center.lat}
              readOnly
            />
          </label>

          <label>
            Longitude
            <input
              ref={register}
              type="text"
              name="geometry.coordinates.1"
              className={controls.text}
              data-testid="loo-name"
              value={center.lng}
              readOnly
            />
          </label>
        </div>

        {props.saveLoading && <Loading message="Saving your changes..." />}

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
          {isFunction(children) ? children({ dirtyFields }) : children}
        </div>
      </form>
    </div>
  );
};

EntryForm.propTypes = {
  map: PropTypes.element.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loo: PropTypes.shape({
    name: PropTypes.string,
    access: PropTypes.string,
    type: PropTypes.string,
    accessibleType: PropTypes.string,
    opening: PropTypes.string,
    fee: PropTypes.string,
    notes: PropTypes.string,
  }),
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  optionsMap: PropTypes.shape({
    access: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string,
      })
    ).isRequired,
    type: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string,
      })
    ).isRequired,
    opening: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  questionnaireMap: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      property: PropTypes.string.isRequired,
    })
  ),
  saveLoading: PropTypes.bool,
  saveError: PropTypes.object,
  saveResponse: PropTypes.object,
};

EntryForm.defaultProps = {
  loo: {},
  questionnaireMap: [],
};

export default EntryForm;

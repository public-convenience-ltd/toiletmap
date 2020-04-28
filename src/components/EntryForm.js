import React from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';

import layout from '../components/css/layout.module.css';
import styles from '../pages/css/edit-loo-page.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import config from '../config';

import Loading from '../components/Loading';
import DismissableBox from './DismissableBox';
import Notification from './Notification';

const EntryForm = ({
  map,
  loo,
  center,
  handleChange,
  handleTriStateChange,
  optionsMap,
  saveResponse,
  saveError,
  ...props
}) => (
  <form>
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

      {props.questionnaireMap.map((q, index) => (
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
      {props.actions.map((action, index) => (
        <React.Fragment key={index} children={action} />
      ))}
    </div>
  </form>
);

EntryForm.propTypes = {
  map: PropTypes.element.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleTriStateChange: PropTypes.func.isRequired,
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
  saveError: PropTypes.func,
  saveResponse: PropTypes.func,
};

EntryForm.defaultProps = {
  loo: {},
  questionnaireMap: [],
};

export default EntryForm;

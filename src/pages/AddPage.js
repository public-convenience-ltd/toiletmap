import React, { useState } from 'react';
import { PropTypes } from 'prop-types';

import queryString from 'query-string';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import EntryForm from '../components/EntryForm';

import config from '../config';
import graphqlMappings from '../graphqlMappings';

import controls from '../css/controls.module.css';

import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import history from '../history';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

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

  const { data } = useNearbyLoos({
    lat: mapPosition.center.lat,
    lng: mapPosition.center.lng,
    radius: mapPosition.radius,
  });

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
      if (changes[q.property] === '') {
        changes[q.property] = null;
      }
    });

    updateLoo({
      variables: changes,
    });
  };

  const MapFragment = () => (
    <LooMap
      loos={data}
      center={mapPosition.center}
      minZoom={config.editMinZoom}
      onMoveEnd={setMapPosition}
      showCenter
      showSearchControl
    />
  );

  const MainFragment = () => (
    <EntryForm
      map={<MapFragment />}
      loo={looState}
      center={mapPosition.center}
      handleChange={handleChange}
      handleTriStateChange={handleTriStateChange}
      questionnaireMap={questionnaireMap}
      saveLoading={saveLoading}
      saveResponse={saveResponse}
      saveError={saveError}
      optionsMap={optionsMap}
      actions={[
        <input
          type="submit"
          className={controls.btn}
          onClick={save}
          value="Add the toilet"
          data-testid="add-the-toilet"
        />,
      ]}
    />
  );

  return <PageLayout main={<MainFragment />} map={<MapFragment />} />;
};

AddPage.propTypes = {
  cache: PropTypes.object,
};

export default AddPage;

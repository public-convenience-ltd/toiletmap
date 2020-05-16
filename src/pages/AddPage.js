import React from 'react';
import queryString from 'query-string';
import { useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import EntryForm from '../components/EntryForm';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

import config from '../config';
import graphqlMappings from '../graphqlMappings';
import history from '../history';
import questionnaireMap from '../questionnaireMap';

import controls from '../css/controls.module.css';

const UPDATE_LOO = loader('./updateLoo.graphql');

const getInitialFormState = () => {
  let state = {
    active: null,
    name: '',
    access: '',
    type: '',
    accessible: '',
    opening: '',
    notes: '',
    fee: '',
  };

  // set questionnaire loo property defaults
  questionnaireMap.forEach((q) => {
    state[q.property] = '';
  });

  return state;
};

const AddPage = (props) => {
  const optionsMap = graphqlMappings.looProps.definitions;

  const [mapPosition, setMapPosition] = useMapPosition();

  const { data } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
  });

  const { lat, lng } = queryString.parse(props.location.search);

  // Set the map position if lat and lng query params are present
  React.useEffect(() => {
    if (lat && lng) {
      setMapPosition({
        center: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        },
      });
    }
  }, [lat, lng, setMapPosition]);

  const [
    updateLoo,
    { loading: saveLoading, data: saveResponse, error: saveError },
  ] = useMutation(UPDATE_LOO);

  // redirect to thanks page if successfully made changes
  if (saveResponse && saveResponse.submitReport.code === '200') {
    history.push(`/loos/${saveResponse.submitReport.loo.id}/thanks`);
  }

  const save = (data) => {
    // add the active state for which there's no user-facing form control as yet
    data.active = true;

    updateLoo({
      variables: data,
    });
  };

  const mapFragment = (
    <LooMap
      loos={data}
      center={mapPosition.center}
      zoom={mapPosition.zoom}
      minZoom={config.editMinZoom}
      onViewportChanged={setMapPosition}
      showCenter
      showSearchControl
      onSearchSelectedItemChange={setMapPosition}
    />
  );

  const mainFragment = (
    <EntryForm
      map={mapFragment}
      loo={getInitialFormState()}
      center={mapPosition.center}
      questionnaireMap={questionnaireMap}
      saveLoading={saveLoading}
      saveResponse={saveResponse}
      saveError={saveError}
      optionsMap={optionsMap}
      onSubmit={save}
    >
      <input
        type="submit"
        className={controls.btn}
        value="Add the toilet"
        data-testid="add-the-toilet"
      />
    </EntryForm>
  );

  return <PageLayout main={mainFragment} map={mapFragment} />;
};

export default AddPage;

import React, { useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { Link } from 'react-router-dom';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import set from 'lodash/set';
import transform from 'lodash/transform';
import isObject from 'lodash/isObject';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import LooMap from '../components/LooMap';
import useNearbyLoos from '../components/useNearbyLoos';
import EntryForm from '../components/EntryForm';

import config from '../config';
import graphqlMappings from '../graphqlMappings';

import controls from '../css/controls.module.css';

import { useQuery, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import history from '../history';
import useMapPosition from '../components/useMapPosition';

const FIND_BY_ID = loader('./findLooById.graphql');
const UPDATE_LOO = loader('./updateLoo.graphql');

const getLooCachedId = (looId) => `Loo: ${looId}`;

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

  const [mapPosition, setMapPosition] = useMapPosition();

  const { data } = useNearbyLoos({
    lat: mapPosition.center.lat,
    lng: mapPosition.center.lng,
    radius: mapPosition.radius,
  });

  // Local state mapCenter to get fix issues with react-leaflet not being stateless and lat lng rounding issues
  const [mapCenter, setMapCenter] = useState();

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
    let newLoo = merge({}, tempLoo, looDataToUse);
    setLooState(newLoo);
    setMapCenter(newLoo.location);

    // Keep track of defaults so we only submit new information
    setOriginal({
      loo: cloneDeep(newLoo),
      center: newLoo.location,
    });
  }, [looData]);

  const handleChange = (event) => {
    // Avoid state mutation
    let loo = cloneDeep(looState);

    // Sets nested loo property value
    set(loo, event.target.name, event.target.value);

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
    var loo = cloneDeep(looState);

    set(loo, event.target.name, val);

    setLooState(loo);
  };

  const getNovelInput = () => {
    const before = cloneDeep(original.loo);
    const now = cloneDeep(looState);

    // Add the active state for which there's no user-facing form control as yet.
    now.active = true;

    // Add location
    before.location = {
      lng: original.center.lng,
      lat: original.center.lat,
    };

    let center = mapCenter;
    now.location = {
      lng: center.lng,
      lat: center.lat,
    };

    // Keep only new or changed data, by comparing to the form's initial state
    const changes = onlyChanges(now, before);

    return changes;
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
    let center = mapCenter;
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

  const getLoosToDisplay = () => {
    let activeLoo;

    if (looData) {
      activeLoo = {
        ...looData.loo,
        isHighlighted: true,
      };
    }

    // Only return the active loos once (activeLoo must be first in array)
    return uniqBy([activeLoo, ...data], 'id').filter(Boolean);
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

  const MapFragment = () => (
    <LooMap
      loos={getLoosToDisplay()}
      center={mapCenter}
      minZoom={config.editMinZoom}
      onMoveEnd={(mapPosition) => {
        setMapCenter(mapPosition.center);
        setMapPosition(mapPosition);
      }}
      showCenter
      showSearchControl
    />
  );

  const MainFragment = () => (
    <EntryForm
      map={<MapFragment />}
      loo={looState}
      center={mapCenter}
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
          value="Update the toilet"
          disabled={isEmpty(getNovelInput())}
        />,
        <Link
          to={`/loos/${props.match.params.id}/remove`}
          className={controls.btnCaution}
        >
          Remove the toilet
        </Link>,
      ]}
    />
  );

  return <PageLayout main={<MainFragment />} map={<MapFragment />} />;
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
  return transform(loo, (acc, value, key) => {
    if (isObject(value)) {
      // Deeply compare
      const nestedChanges = onlyChanges(value, from[key]);
      if (!isEmpty(nestedChanges)) {
        acc[key] = nestedChanges;
      }
    } else if (value !== from[key]) {
      // Only keep a value in loo if it is changed
      acc[key] = value;
    }
  });
}

export default EditPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/client';

import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Spacer from '../components/Spacer';
import Loading from '../components/Loading';
import EntryForm from '../components/EntryForm';
import LooMap from '../components/LooMap';
import Box from '../components/Box';

import useNearbyLoos from '../components/useNearbyLoos';
import useMapPosition from '../components/useMapPosition';

import config from '../config';
import graphqlMappings from '../graphqlMappings';
import history from '../history';

const FIND_BY_ID = loader('./findLooById.graphql');
const UPDATE_LOO = loader('./updateLoo.graphql');

const EditPage = (props) => {
  const optionsMap = graphqlMappings.looProps.definitions;

  // find the raw loo data for the given loo
  const { loading: loadingLooData, data: looData, error: looError } = useQuery(
    FIND_BY_ID,
    {
      variables: {
        id: props.match.params.id,
      },
    }
  );

  const [mapPosition, setMapPosition] = useMapPosition();

  const looLocation = (looData && looData.loo.location) || null;

  // set the map position to the loo location
  React.useEffect(() => {
    if (looLocation) {
      setMapPosition({ center: looLocation });
    }
  }, [looLocation, setMapPosition]);

  const { data } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
  });

  // local state mapCenter to get fix issues with react-leaflet not being stateless and lat lng rounding issues
  const [mapCenter, setMapCenter] = useState();

  const [initialData, setInitialData] = useState();

  useEffect(() => {
    if (!looData) {
      return;
    }

    const toilet = cloneDeep(merge({}, { active: null }, looData.loo));
    setMapCenter(toilet.location);

    // keep track of defaults so we only submit new information
    setInitialData({
      loo: toilet,
      center: {
        lat: toilet.location.lat,
        lng: toilet.location.lng,
      },
    });
  }, [looData]);

  const [
    updateLoo,
    { loading: saveLoading, data: saveResponse, error: saveError },
  ] = useMutation(UPDATE_LOO);

  if (saveError) {
    console.error('error saving:', saveError);
  }

  // redirect to thanks page if successfully made changes
  if (saveResponse && saveResponse.submitReport.code === '200') {
    history.push(`/loos/${saveResponse.submitReport.loo.id}/thanks`);
  }

  const save = (data) => {
    const id = looData.loo.id;

    updateLoo({
      variables: {
        ...data,
        id,
      },
    });
  };

  if (loadingLooData || !looData || !initialData) {
    return (
      <PageLayout>
        <Loading message="Fetching Toilet Data" />
      </PageLayout>
    );
  }

  if (looError) {
    console.error(looError);

    return (
      <PageLayout>
        <Loading message="Error fetching toilet data" />
      </PageLayout>
    );
  }

  // redirect to index if loo is not active (i.e. removed)
  if (looData && !looData.loo.active) {
    history.push('/');
  }

  const getLoosToDisplay = () => {
    let activeLoo;

    if (looData) {
      activeLoo = {
        ...looData.loo,
        isHighlighted: true,
      };
    }

    // only return the active loos once (activeLoo must be first in array)
    return uniqBy([activeLoo, ...data], 'id').filter(Boolean);
  };

  return (
    <PageLayout>
      <Box display="flex" height={300} maxHeight="40vh">
        <LooMap
          loos={getLoosToDisplay()}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          minZoom={config.editMinZoom}
          onViewportChanged={(mapPosition) => {
            setMapCenter(mapPosition.center);
            setMapPosition(mapPosition);
          }}
          showCenter
          showContributor
          showSearchControl
          showLocateControl
        />
      </Box>

      <Spacer mt={4} />

      <EntryForm
        loo={initialData.loo}
        center={mapCenter}
        saveLoading={saveLoading}
        saveResponse={saveResponse}
        saveError={saveError}
        optionsMap={optionsMap}
        onSubmit={save}
      >
        {({ hasDirtyFields }) => (
          <Box display="flex" flexDirection="column" alignItems="center">
            <Button
              type="submit"
              disabled={!hasDirtyFields}
              css={{
                width: '100%',
              }}
            >
              Update the toilet
            </Button>

            <Spacer mt={2} />

            <Button
              as={Link}
              to={`/loos/${props.match.params.id}/remove`}
              css={{
                width: '100%',
              }}
            >
              Remove the toilet
            </Button>
          </Box>
        )}
      </EntryForm>

      <Spacer mt={4} />
    </PageLayout>
  );
};

export default EditPage;

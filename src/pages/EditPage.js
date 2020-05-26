import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import uniqBy from 'lodash/uniqBy';
import { css } from '@emotion/core';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/client';

import PageLayout from '../components/PageLayout';
import Button from '../components/Button';
import Spacer from '../components/Spacer';
import Notification from '../components/Notification';
import EntryForm from '../components/EntryForm';
import LooMap from '../components/LooMap';
import Box from '../components/Box';

import useNearbyLoos from '../components/useNearbyLoos';
import useMapPosition from '../components/useMapPosition';

import config from '../config';
import history from '../history';

const FIND_BY_ID = loader('./findLooById.graphql');
const UPDATE_LOO = loader('./updateLoo.graphql');

const EditPage = (props) => {
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
    console.error('saving', saveError);
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

  if (loadingLooData || !looData || !initialData || looError) {
    return (
      <PageLayout>
        <Box
          my={4}
          mx="auto"
          css={css`
            max-width: 360px; /* fallback */
            max-width: fit-content;
          `}
        >
          <Notification>
            {looError ? 'Error fetching toilet data' : 'Fetching Toilet Data'}
          </Notification>
        </Box>
      </PageLayout>
    );
  }

  // redirect to index if loo is not active (i.e. removed)
  if (looData && !looData.loo.active) {
    history.push('/');
  }

  // redirect to new toilet entry page on successful addition
  if (saveResponse && saveResponse.submitReport.code === '200') {
    history.push(`/loos/${saveResponse.submitReport.loo.id}?message=updated`);
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
          showCenter
          showContributor
          showLocateControl
          showCrosshair
        />
      </Box>

      <Spacer mt={4} />

      <EntryForm
        title="Edit This Toilet"
        loo={initialData.loo}
        center={mapCenter}
        saveLoading={saveLoading}
        saveResponse={saveResponse}
        saveError={saveError}
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

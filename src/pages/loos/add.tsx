import React, { useEffect } from 'react';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import EntryForm from '../../components/EntryForm';
import Box from '../../components/Box';
import Spacer from '../../components/Spacer';
import Button from '../../components/Button';
import LocationSearch from '../../components/LocationSearch';
import Login from '../../components/Login';

import { useMapState } from '../../components/MapState';

import config from '../../config';
import { useRouter } from 'next/router';
import { withApollo } from '../../components/withApollo';
import {
  UpdateLooMutationVariables,
  useUpdateLooMutation,
} from '../../api-client/graphql';
import PageLoading from '../../components/PageLoading';
import LooMap from '../../components/LooMap/LooMapLoader';

const initialFormState = {
  active: null,
  noPayment: true,
};

const AddPage = () => {
  const { user, error, isLoading } = useUser();
  const [mapState, setMapState] = useMapState();

  const router = useRouter();

  const { lat, lng } = router.query;

  // set the map position if lat and lng query params are present
  React.useEffect(() => {
    if (lat && lng) {
      setMapState({
        center: {
          lat: parseFloat(lat as string),
          lng: parseFloat(lng as string),
        },
      });
    }
  }, [lat, lng, setMapState]);

  const [
    updateLooMutation,
    { data: saveData, loading: saveLoading, error: saveError },
  ] = useUpdateLooMutation();

  const saveLoo = async (formData: UpdateLooMutationVariables) => {
    // add the active state for which there's no user-facing form control as yet
    formData.active = true;

    const { errors } = await updateLooMutation({
      variables: { ...formData },
    });

    if (errors) {
      console.error('save error', errors);
    }
  };

  // redirect to new toilet entry page upon successful addition
  useEffect(() => {
    if (saveData) {
      router.push(`/loos/${saveData.submitReport.loo.id}?message=created`);
    }
  }, [saveData, router]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Head>
        <title>{config.getTitle('Add Toilet')}</title>
      </Head>

      <Box position="relative" display="flex" height="40vh">
        <LooMap
          center={mapState.center}
          zoom={mapState.zoom}
          minZoom={config.editMinZoom}
          showCrosshair
          controlsOffset={20}
          withAccessibilityOverlays={false}
        />

        <Box position="absolute" top={0} left={0} m={3}>
          <LocationSearch
            onSelectedItemChange={(center) => setMapState({ center })}
          />
        </Box>
      </Box>

      <Spacer mt={4} />

      <EntryForm
        title="Add This Toilet"
        loo={initialFormState}
        saveLoading={saveLoading}
        saveError={saveError}
        onSubmit={saveLoo}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Button type="submit" data-testid="add-the-toilet">
            Save toilet
          </Button>
        </Box>
      </EntryForm>

      <Spacer mt={4} />
    </>
  );
};

export default withApollo(AddPage);

import React, { useEffect } from 'react';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import EntryForm from '../../components/EntryForm';
import Box from '../../components/Box';
import Spacer from '../../components/Spacer';
import Button from '../../design-system/components/Button';
import LocationSearch from '../../components/LocationSearch';
import Login from '../login.page';

import { useMapState } from '../../components/MapState';

import config from '../../config';
import { useRouter } from 'next/router';
import { withApollo } from '../../api-client/withApollo';
import {
  UpdateLooMutationVariables,
  useUpdateLooMutation,
} from '../../api-client/graphql';
import PageLoading from '../../components/PageLoading';
import { LooMapLoader } from '../../components/LooMap/LooMapLoader';

const initialFormState = {
  active: null,
  noPayment: true,
};

const AddPage = () => {
  const { user, isLoading } = useUser();
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

  const [revalidationComplete, setRevalidationComplete] = React.useState(false);

  const [
    updateLooMutation,
    { data: saveData, loading: saveLoading, error: saveError },
  ] = useUpdateLooMutation();

  const saveLoo = async (formData: UpdateLooMutationVariables) => {
    // add the active state for which there's no user-facing form control as yet
    const { errors } = await updateLooMutation({
      variables: { ...formData, active: true },
    });

    if (errors) {
      console.log(formData);
      console.error('save error', errors);
    }

    try {
      // Make sure that we revalidate the /loo/[id] ISR route.
      const result = await (
        await fetch(`/api/loos/${formData.id}/revalidate`)
      ).json();

      if (result?.ok) {
        setRevalidationComplete(true);
      }
    } catch (e) {
      console.error('Error revalidating the page', e);
    }
  };

  // redirect to new toilet entry page upon successful addition
  useEffect(() => {
    if (saveData && revalidationComplete) {
      setMapState({ searchLocation: undefined });

      // redirect to updated toilet entry page
      router.push(`/loos/${saveData.submitReport.loo.id}?message=created`);
    }
  }, [saveData, router, setMapState, revalidationComplete]);

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
        <LooMapLoader
          center={mapState.center}
          zoom={mapState.zoom}
          minZoom={config.editMinZoom}
          showCrosshair
          controlsOffset={20}
          withAccessibilityOverlays={false}
          alwaysShowGeolocateButton={true}
          controlPositionOverride="bottom"
        />

        <Box position="absolute" top={0} left={0} m={3}>
          <LocationSearch
            onSelectedItemChange={(searchLocation) =>
              setMapState({ searchLocation })
            }
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
          <Button
            htmlElement="button"
            variant="primary"
            type="submit"
            data-testid="add-the-toilet"
          >
            Save toilet
          </Button>
        </Box>
      </EntryForm>

      <Spacer mt={4} />
    </>
  );
};

export default withApollo(AddPage);

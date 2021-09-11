import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import { withPageAuthRequired } from '@auth0/nextjs-auth0';


import PageLayout from '../../../components/PageLayout';
import Button from '../../../components/Button';
import Spacer from '../../../components/Spacer';
import EntryForm from '../../../components/EntryForm';
import Box from '../../../components/Box';

import config from '../../../config';
import useNearbyLoos from '../../../components/useNearbyLoos';
import { useMapState } from '../../../components/MapState';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { withApollo } from '../../../components/withApollo';
import { NextPage } from 'next';

const EditPage = (props: { match: { params: { id: any; }; }; }) => {
  const router = useRouter();
  const {id: selectedLooId} = router.query;

  // const {
  //   isValidating: loadingLooData,
  //   data: looData,
  //   error: looError,
  // } = useSWR(
  //   [FIND_LOO_BY_ID_QUERY, JSON.stringify({ id: selectedLooId })],
  //   {
  //     revalidateOnFocus: false,
  //   }
  // );

  const [mapState, setMapState] = useMapState();

  // const looLocation = (looData && looData.loo.location) || null;

  const LooMap = React.useMemo(() => dynamic(() => import('../../../components/LooMap'), { loading: () => <p>Loading map...</p>, ssr: false, }), [])

  // set the map position to the loo location
  // React.useEffect(() => {
  //   if (looLocation) {
  //     setMapState({ center: looLocation });
  //   }
  // }, [looLocation, setMapState]);

  const { data } = useNearbyLoos({
    lat: mapState.center.lat,
    lng: mapState.center.lng,
    radius: mapState.radius,
  });

  // local state mapCenter to get fix issues with react-leaflet not being stateless and lat lng rounding issues
  const [mapCenter, setMapCenter] = useState();

  const [initialData, setInitialData] = useState();

  // useEffect(() => {
  //   if (!looData) {
  //     return;
  //   }

  //   const toilet = cloneDeep(merge({}, { active: null }, looData.loo));
  //   setMapCenter(toilet.location);

  //   // keep track of defaults so we only submit new information
  //   setInitialData({
  //     loo: toilet,
  //     center: {
  //       lat: toilet.location.lat,
  //       lng: toilet.location.lng,
  //     },
  //   });
  // }, [looData]);

  // const [
  //   updateLoo,
  //   { loading: saveLoading, data: saveData, error: saveError },
  // ] = useMutation(UPDATE_LOO_MUTATION);

  // const save = async (formData: { id: any; }) => {
  //   formData.id = looData.loo.id;

  //   try {
  //     const data = await updateLoo(formData);

  //     // update cached query
  //     mutate(
  //       [
  //         FIND_LOO_BY_ID_QUERY,
  //         JSON.stringify({ id: data.submitReport.loo.id }),
  //       ],
  //       {
  //         loo: data.submitReport.loo,
  //       }
  //     );
  //   } catch (err) {
  //     console.error('save error', err);
  //   }
  // };

  // if (saveData) {
  //   // redirect to updated toilet entry page
  //   router.push(`/loos/${saveData.submitReport.loo.id}?message=updated`)
  // }

  // if (loadingLooData || !looData || !initialData || looError) {
  //   return (
  //     <PageLayout>
  //       <Box
  //         my={4}
  //         mx="auto"
  //         css={css`
  //           max-width: 360px; /* fallback */
  //           max-width: fit-content;
  //         `}
  //       >
  //         <Notification>
  //           {looError ? 'Error fetching toilet data' : 'Fetching Toilet Data'}
  //         </Notification>
  //       </Box>
  //     </PageLayout>
  //   );
  // }

  // redirect to index if loo is not active (i.e. removed)
  // if (looData && !looData.loo.active) {
  //   router.push('/');
  // }

  // const getLoosToDisplay = () => {
  //   let activeLoo;

  //   if (looData) {
  //     activeLoo = {
  //       ...looData.loo,
  //       isHighlighted: true,
  //     };
  //   }

  //   // only return the active loos once (activeLoo must be first in array)
  //   return uniqBy([activeLoo, ...data], 'id').filter(Boolean);
  // };

  return (
    <PageLayout>
      <>
        <Head>
          <title>{config.getTitle('Edit Toilet')}</title>
        </Head>

        <Box display="flex" height="40vh">
          {/* <LooMap
            loos={getLoosToDisplay()}
            center={mapState.center}
            zoom={mapState.zoom}
            minZoom={config.editMinZoom}
            showCenter
            showContributor
            showLocateControl
            showCrosshair
            controlsOffset={20}
            withAccessibilityOverlays={false}
            onViewportChanged={(mapPosition: { center: (prevState: undefined) => undefined; }) => {
              setMapCenter(mapPosition.center);
            }}
          /> */}
        </Box>

        <Spacer mt={4} />
{/*
        <EntryForm
          title="Edit This Toilet"
          loo={initialData.loo}
          center={mapCenter}
          saveLoading={saveLoading}
          saveError={saveError}
          onSubmit={save}
        >
          {({ isDirty }) => (
            <Box display="flex" flexDirection="column" alignItems="center">
              <Button
                type="submit"
                disabled={!isDirty}
                css={{
                  width: '100%',
                }}
                data-testid="update-toilet-button"
              >
                Update the toilet
              </Button>

              <Spacer mt={2} />

              <Button
                as={Link}
                href={`/loos/${selectedLooId}/remove`}
                css={{
                  width: '100%',
                }}
                data-testid="remove-toilet-button"
              >
                Remove the toilet
              </Button>
            </Box>
          )}
        </EntryForm> */}
      </>
    </PageLayout>
  );
};

export default withApollo(EditPage as NextPage);

export const getServerSideProps = withPageAuthRequired();

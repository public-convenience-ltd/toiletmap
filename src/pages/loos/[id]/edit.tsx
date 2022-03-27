import Head from 'next/head';
import Link from 'next/link';

import { useUser } from '@auth0/nextjs-auth0';
import Button from '../../../components/Button';
import Spacer from '../../../components/Spacer';
import EntryForm from '../../../components/EntryForm';
import Box from '../../../components/Box';
import Login from '../../../components/Login';
import PageLoading from '../../../components/PageLoading';
import LooMap from '../../../components/LooMap/LooMapLoader';

import config from '../../../config';
import { useMapState } from '../../../components/MapState';
import { useRouter } from 'next/router';
import { withApollo } from '../../../api-client/withApollo';
import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';
import { GetServerSideProps } from 'next';
import { dbConnect } from '../../../api/db';
import {
  UpdateLooMutationVariables,
  useUpdateLooMutation,
} from '../../../api-client/graphql';
import { useEffect } from 'react';
import LocationSearch from '../../../components/LocationSearch';

const EditPage: PageFindLooByIdComp = (props) => {
  const loo = props.data.loo;
  const router = useRouter();
  const { isLoading, user } = useUser();
  const [mapState, setMapState] = useMapState();

  useEffect(() => {
    setMapState({ focus: loo, center: loo.location });
  }, [loo, setMapState]);

  const [
    updateLooMutation,
    { data: saveData, loading: saveLoading, error: saveError },
  ] = useUpdateLooMutation();

  const save = async (formData: UpdateLooMutationVariables) => {
    const { errors } = await updateLooMutation({
      variables: { ...formData, id: loo.id },
    });

    if (errors) {
      console.error('save error', errors);
    }
  };

  // redirect to toilet entry page upon successful edit
  useEffect(() => {
    if (saveData) {
      setMapState({ searchLocation: undefined });
      // redirect to updated toilet entry page
      router.push(`/loos/${saveData.submitReport.loo.id}?message=updated`);
    }
  }, [saveData, router, setMapState]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!user) {
    return <Login />;
  }

  // redirect to index if loo is not active (i.e. removed)
  if (loo && !loo.active) {
    router.push('/');
  }

  return (
    <>
      <Head>
        <title>{config.getTitle('Edit Toilet')}</title>
      </Head>

      <Box display="flex" height="40vh">
        <LooMap
          center={loo.location}
          zoom={mapState.zoom}
          minZoom={config.editMinZoom}
          showCrosshair
          controlsOffset={20}
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

      {loo && (
        <EntryForm
          title="Edit This Toilet"
          loo={loo}
          saveLoading={saveLoading}
          saveError={saveError}
          onSubmit={save}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Button
              type="submit"
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
              href={`/loos/${loo.id}/remove`}
              css={{
                width: '100%',
              }}
              data-testid="remove-toilet-button"
            >
              Remove the toilet
            </Button>
          </Box>
        </EntryForm>
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  await dbConnect();
  const res = await ssrFindLooById.getServerPage(
    {
      variables: { id: ctx.params.id as string },
    },
    ctx
  );

  if (res.props.error || !res.props.data) {
    return {
      notFound: true,
    };
  }

  return res;
};

export default withApollo(EditPage);

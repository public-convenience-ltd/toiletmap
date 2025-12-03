import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import config from '../../../config';

import Container from '../../../components/Container';
import Box from '../../../components/Box';
import Spacer from '../../../components/Spacer';
import Text from '../../../components/Text';
import Button from '../../../design-system/components/Button';
import Banner from '../../../design-system/components/Banner';
import Login from '../../login.page';
import PageLoading from '../../../components/PageLoading';
import { useRouter } from 'next/router';
import { useRemoveLooMutation } from '../../../api-client/graphql';
import { withApollo } from '../../../api-client/withApollo';
import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';
import { GetServerSideProps } from 'next';
import NotFound from '../../404.page';
import { useMapState } from '../../../components/MapState';
import TextArea from '../../../design-system/components/TextArea';

const RemovePage: PageFindLooByIdComp | React.FC<{ notFound?: boolean }> =
  function (props) {
    const loo = props?.data?.loo;
    const router = useRouter();
    const { user, isLoading } = useUser();
    const [reason, setReason] = useState('');
    const [, setMapState] = useMapState();

    const [revalidationComplete, setRevalidationComplete] = useState(false);

    const [
      removeLooMutation,
      { loading: loadingRemove, error: removeError, data: removeData },
    ] = useRemoveLooMutation();

    const updateReason = (evt) => {
      setReason(evt.currentTarget.value);
    };

    const onSubmit = async (e: { preventDefault: () => void }) => {
      e.preventDefault();

      const { errors } = await removeLooMutation({
        variables: {
          id: loo?.id,
          reason,
        },
      });

      if (errors) {
        console.error('remove error', errors);
      }

      try {
        // Make sure that we revalidate the /loo/[id] ISR route.
        const result = await (
          await fetch(`/api/loos/${loo.id}/revalidate`)
        ).json();

        if (result?.ok) {
          setRevalidationComplete(true);
        }
      } catch (e) {
        console.error('Error revalidating the page', e);
      }
    };

    // redirect to toilet entry page upon successful removal
    useEffect(() => {
      if (removeData && revalidationComplete) {
        setMapState({ searchLocation: undefined });
        // redirect to updated toilet entry page
        router.push(
          `/loos/${removeData.submitRemovalReport.loo.id}?message=removed`,
        );
      }
    }, [removeData, router, setMapState, revalidationComplete]);

    if (isLoading) {
      return <PageLoading />;
    }

    if (props?.notFound || !props?.data?.loo) {
      return (
        <>
          <Head>
            <title>{config.getTitle('Remove Toilet')}</title>
          </Head>

          <NotFound>
            <Banner variant="error" title="Error">
              <p>Error fetching toilet data</p>
            </Banner>
          </NotFound>
        </>
      );
    }

    if (removeError) {
      console.error(removeError);
    }

    if (!loo.active) {
      router.push('/');
    }

    if (!user) {
      return <Login />;
    }

    return (
      <Box my={5}>
        <Head>
          <title>{config.getTitle('Remove Toilet')}</title>
        </Head>

        <Container maxWidth={845}>
          <Text fontSize={6} fontWeight="bold" textAlign="center">
            <h1>Toilet Remover</h1>
          </Text>

          <Spacer mb={5} />

          {loadingRemove && (
            <Banner variant="info" title="Submitting">
              Submitting removal report
            </Banner>
          )}

          <Spacer mb={3} />

          {removeError && (
            <Banner variant="error" title="Error">
              Oops. We can&lsquo;t submit your report at this time. Try again
              later.
            </Banner>
          )}

          <Spacer mb={3} />

          <p>
            Please let us know why you&apos;re removing this toilet from the map
            using the form below.
          </p>

          <Spacer mb={3} />

          <form onSubmit={onSubmit}>
            <label>
              <b>Reason for removal</b>
              <TextArea
                rows={4}
                name="reason"
                value={reason}
                onChange={updateReason}
                required
              />
            </label>

            <Spacer mb={3} />

            <Button
              htmlElement="button"
              variant="primary"
              type="submit"
              disabled={loadingRemove}
            >
              Remove
            </Button>
          </form>
        </Container>
      </Box>
    );
  };

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const res = await ssrFindLooById.getServerPage(
      {
        variables: { id: ctx.params.id as string },
      },
      ctx,
    );

    if (res.props.error || !res.props.data) {
      return {
        props: {
          notFound: true,
        },
      };
    }

    return res;
  } catch {
    return {
      props: {
        notFound: true,
      },
    };
  }
};

export default withApollo(RemovePage);

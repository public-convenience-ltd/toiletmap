import { useState } from 'react';
import Head from 'next/head';
import { useUser } from '@auth0/nextjs-auth0';

import config from '../../../config';

import Container from '../../../components/Container';
import Box from '../../../components/Box';
import Spacer from '../../../components/Spacer';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import Notification from '../../../components/Notification';
import Login from '../../../components/Login';
import PageLoading from '../../../components/PageLoading';
import { useRouter } from 'next/router';
import { useRemoveLooMutation } from '../../../api-client/graphql';
import { withApollo } from '../../../api-client/withApollo';
import { ssrFindLooById, PageFindLooByIdComp } from '../../../api-client/page';
import { GetServerSideProps } from 'next';

const RemovePage: PageFindLooByIdComp = function (props) {
  const loo = props.data.loo;
  const { user, isLoading } = useUser();

  const [reason, setReason] = useState('');
  const router = useRouter();

  const [removeLooMutation, { loading: loadingRemove, error: removeError }] =
    useRemoveLooMutation();

  const updateReason = (evt) => {
    setReason(evt.currentTarget.value);
  };

  const onSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    await removeLooMutation({
      variables: {
        id: loo.id,
        reason,
      },
    });

    router.push(`/loos/${loo.id}?message=removed`);
  };

  if (removeError) {
    console.error(removeError);
  }

  if (!loo.active) {
    router.push('/');
  }

  if (isLoading) {
    return <PageLoading />;
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

        <p>
          Please let us know why you&apos;re removing this toilet from the map
          using the form below.
        </p>

        <Spacer mb={3} />

        <form onSubmit={onSubmit}>
          <label>
            <b>Reason for removal</b>
            <textarea
              type="text"
              name="reason"
              value={reason}
              onChange={updateReason}
              required
              css={{
                height: '100px',
                width: '100%',
              }}
            />
          </label>

          <Spacer mb={3} />

          <Button type="submit">Remove</Button>
        </form>

        {loadingRemove && (
          <Notification>Submitting removal report&hellip;</Notification>
        )}

        {removeError && (
          <Notification>
            Oops. We can&lsquo;t submit your report at this time. Try again
            later.
          </Notification>
        )}
      </Container>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { dbConnect } = await import('../../../api/db');
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

export default withApollo(RemovePage);

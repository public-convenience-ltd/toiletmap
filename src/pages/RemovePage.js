import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';
import { Redirect } from 'react-router-dom';

import config from '../config';

import PageLayout from '../components/PageLayout';
import Container from '../components/Container';
import Spacer from '../components/Spacer';
import Text from '../components/Text';
import Button from '../components/Button';
import Notification from '../components/Notification';

const FIND_LOO_BY_ID = loader('./findLooById.graphql');
const REMOVE_LOO_MUTATION = loader('./removeLoo.graphql');

const RemovePage = function (props) {
  const [reason, setReason] = useState('');

  const { loading: loadingLoo, data: looData, error: looError } = useQuery(
    FIND_LOO_BY_ID,
    {
      variables: {
        id: props.match.params.id,
      },
    }
  );

  const [
    doRemove,
    { loading: loadingRemove, error: removeError },
  ] = useMutation(REMOVE_LOO_MUTATION, {
    onCompleted: () => {
      props.history.push(`/loos/${props.match.params.id}?message=removed`);
    },
  });

  const updateReason = (evt) => {
    setReason(evt.currentTarget.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    doRemove({
      variables: {
        id: looData.loo.id,
        reason,
      },
    });
  };

  if (removeError || looError) {
    console.error(removeError || looError);
  }

  if (loadingLoo || looError) {
    return (
      <PageLayout>
        <Notification>
          {loadingLoo ? 'Fetching Toilet Data' : 'Error finding toilet.'}
        </Notification>
      </PageLayout>
    );
  }

  if (!looData.loo.active) {
    return <Redirect to="/" />;
  }

  return (
    <PageLayout>
      <Helmet>
        <title>{config.getTitle('Remove Toilet')}</title>
      </Helmet>

      <Container maxWidth={845}>
        <Spacer mb={5} />

        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>Toilet Remover</h1>
        </Text>

        <Spacer mb={5} />

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
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
            Oops. We can't submit your report at this time. Try again later.
          </Notification>
        )}
      </Container>
    </PageLayout>
  );
};

export default RemovePage;

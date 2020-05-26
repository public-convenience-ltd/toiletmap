import React, { useState } from 'react';

import { useQuery, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import history from '../history';

import PageLayout from '../components/PageLayout';
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
    history.push('/');
  }

  return (
    <PageLayout>
      <div>
        <h2>Toilet Remover</h2>

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
        </p>

        <form onSubmit={onSubmit}>
          <label>
            Reason for removal
            <textarea
              type="text"
              name="reason"
              value={reason}
              onChange={updateReason}
              required
            />
          </label>

          <button type="submit">Remove</button>
        </form>

        {loadingRemove && (
          <Notification>Submitting removal report&hellip;</Notification>
        )}

        {removeError && (
          <Notification>
            Oops. We can't submit your report at this time. Try again later.
          </Notification>
        )}
      </div>
    </PageLayout>
  );
};

export default RemovePage;

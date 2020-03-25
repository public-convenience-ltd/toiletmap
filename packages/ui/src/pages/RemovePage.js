import React, { useState } from 'react';

import { useQuery, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import config from '../config';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import LooMap from '../components/LooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

const FIND_LOO_BY_ID = loader('./findLooLocationById.graphql');
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
      props.history.push('/');
    },
  });

  const updateReason = (evt) => {
    setReason(evt.currentTarget.value);
  };

  const doSubmit = () => {
    doRemove({
      variables: {
        id: looData.loo.id,
        reason,
      },
    });
  };

  const renderMain = () => {
    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button onClick={props.history.goBack} className={controls.btn}>
                Back
              </button>
            )}
          </div>
        </div>

        <h2 className={headings.large}>Toilet Remover</h2>

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
        </p>

        <label>
          Reason for removal
          <textarea
            type="text"
            name="reason"
            className={controls.text}
            value={reason}
            onChange={updateReason}
          />
        </label>

        <button onClick={doSubmit} className={controls.btnCaution}>
          Remove it
        </button>

        {loadingRemove && <Loading message="Submitting removal report..." />}
        {removeError && (
          <Loading message="Oops. We can't submit your report at this time. Try again later." />
        )}
      </div>
    );
  };

  const renderMap = () => {
    var coords = looData.loo.location;
    return (
      <LooMap
        loos={[looData.loo]}
        initialPosition={coords}
        highlight={looData.loo.id}
        showLocation={false}
        showSearchControl={false}
        showLocateControl={false}
        showCenter={false}
        preventDragging={true}
        preventZoom={true}
        minZoom={config.editMinZoom}
      />
    );
  };

  if (removeError || looError) {
    console.error(removeError || looError);
  }

  if (loadingLoo || looError) {
    let msg = loadingLoo ? 'Fetching Toilet Data' : 'Error finding toilet.';
    return (
      <PageLayout
        main={<Loading message={msg} />}
        map={<Loading message={msg} />}
      />
    );
  }
  return <PageLayout main={renderMain()} map={renderMap()} />;
};

export default RemovePage;

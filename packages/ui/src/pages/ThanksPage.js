import React from 'react';

import { useQuery, gql } from '@apollo/client';
import { loader } from 'graphql.macro';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import NearestLooMap from '../components/NearestLooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import config from '../config';

import WithApolloClient from '../components/WithApolloClient';

const FIND_BY_ID = loader('./findLooById.graphql');

function constructCampaignLink(loo, email = '') {
  let loc = loo.location;
  let coords = `${loc.lng},${loc.lat}`;
  let name = loo.name || '';
  let opening = loo.opening || '';
  return `https://docs.google.com/forms/d/e/1FAIpQLScMvkjoE68mR1Z-yyVH7YhdndHCd_k8QwbugwfbqgZGUr_DvQ/viewform?emailAddress=${encodeURIComponent(
    email
  )}&entry.975653982=${encodeURIComponent(
    coords
  )}&entry.688810578=${encodeURIComponent(
    name
  )}&entry.1574991632=${encodeURIComponent(opening)}`;
}

const GET_USER_DATA = gql`
  {
    userData @client {
      name
    }
  }
`;

const ThanksPage = function(props) {
  const { loading: loadingLoo, data: looData, error: looError } = useQuery(
    FIND_BY_ID,
    {
      variables: {
        id: props.match.params.id,
      },
    }
  );

  const {
    data: { userData },
  } = useQuery(GET_USER_DATA);

  const renderMain = () => {
    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button
                onClick={this.props.history.goBack}
                className={controls.btn}
              >
                Back
              </button>
            )}
          </div>
        </div>
        <h2 id="thanks" className={headings.regular}>
          Thank You!
        </h2>
        <p>Thanks for the information you've provided.</p>
        <p>
          We rely on contributions of data like yours to keep the map accurate
          and useful.
        </p>
        <p>Please consider signing up with our sponsor's campaign.</p>
        <a
          className={controls.btnFeatured}
          target="_blank"
          rel="noopener noreferrer"
          href={constructCampaignLink(looData.loo, userData.name)}
        >
          Join the <strong>Use Our Loos</strong> campaign
        </a>
      </div>
    );
  };

  const renderMap = () => {
    return (
      <NearestLooMap
        loo={looData.loo}
        mapProps={{
          showLocation: false,
          showSearchControl: false,
          showLocateControl: false,
          showCenter: false,
          countLimit: null,
        }}
        highlight={props.match.params.id}
      />
    );
  };

  if (loadingLoo || looError) {
    let message = 'Fetching Toilet Data';
    if (looError) {
      message = 'Error Fetching Toilet Data';
    }

    return (
      <PageLayout
        main={<Loading message={message} />}
        map={<Loading message={message} />}
      />
    );
  }

  return <PageLayout main={renderMain()} map={renderMap()} />;
};

const ThanksPageWithApolloClient = props => (
  <WithApolloClient>
    <ThanksPage {...props} />
  </WithApolloClient>
);

export default ThanksPageWithApolloClient;

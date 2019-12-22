import React, { useEffect } from 'react';

import WithApolloClient from '../components/WithApolloClient';
import { gql } from '@apollo/client';
import PageLayout from '../components/PageLayout';
import Notification from '../components/Notification';
import MediaQuery from 'react-responsive';
import config from '../config';

const Callback = function(props) {
  useEffect(() => {
    // This is pretty horrible but necessary, since useEffect can't take an async function
    (async () => {
      if (/access_token|id_token|error/.test(props.location.hash)) {
        await props.auth.handleAuthentication();
        await props.auth.fetchProfile();
      }
    })().then(() => {
      if (props.auth.isAuthenticated()) {
        // Update state to set logged in
        props.apolloClient.writeQuery({
          query: gql`
            query updateUserData {
              userData {
                loggedIn
                name
              }
            }
          `,
          data: {
            userData: {
              loggedIn: true,
              name: props.auth.getProfile().name,
            },
          },
        });
        props.history.push(props.auth.redirectOnLogin() || '/');
      } else {
        props.history.push('/login');
      }
    });
  });

  return (
    <PageLayout
      main={
        <MediaQuery minWidth={config.viewport.mobile}>
          <Notification>
            <p>Updating credentials</p>
          </Notification>
        </MediaQuery>
      }
      map={
        <MediaQuery minWidth={config.viewport.mobile}>
          <Notification>
            <p>Updating credentials</p>
          </Notification>
        </MediaQuery>
      }
    />
  );
};

const CallbackWithApolloClient = props => (
  <WithApolloClient>
    <Callback {...props} />
  </WithApolloClient>
);

export default CallbackWithApolloClient;

import React, { useEffect } from 'react';

import { useMutation, gql } from '@apollo/client';
import PageLayout from '../components/PageLayout';
import Notification from '../components/Notification';
import MediaQuery from 'react-responsive';
import config from '../config';

const MUTATION_LOGIN = gql`
  mutation LoginUser($name: String!) {
    loginUser(name: $name) @client
  }
`;

const Callback = function(props) {
  const [doLogin] = useMutation(MUTATION_LOGIN);

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
        doLogin({
          variables: {
            name: props.auth.getProfile().name,
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

export default Callback;

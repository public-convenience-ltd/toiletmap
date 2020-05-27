import React, { useEffect } from 'react';

import { useMutation, gql } from '@apollo/client';
import PageLayout from '../components/PageLayout';
import Notification from '../components/Notification';
import MediaQuery from 'react-responsive';
import config from '../config';

import { useAuth } from '../Auth';

const MUTATION_LOGIN = gql`
  mutation LoginUser($name: String!) {
    loginUser(name: $name) @client
  }
`;

const Callback = (props) => {
  const auth = useAuth();
  const [doLogin] = useMutation(MUTATION_LOGIN);

  useEffect(() => {
    // This is pretty horrible but necessary, since useEffect can't take an async function
    (async () => {
      if (/access_token|id_token|error/.test(props.location.hash)) {
        await auth.handleAuthentication();
        await auth.fetchProfile();
      }
    })().then(() => {
      if (auth.isAuthenticated()) {
        // Update state to set logged in
        doLogin({
          variables: {
            name: auth.getProfile().name,
          },
        });
        props.history.push(auth.redirectOnLogin() || '/');
      } else {
        props.history.push('/contribute');
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

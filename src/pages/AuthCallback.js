import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';

import { useAuth } from '../Auth';
import PageLayout from '../components/PageLayout';

const MUTATION_LOGIN = gql`
  mutation LoginUser($name: String!) {
    loginUser(name: $name) @client
  }
`;

const Callback = () => {
  const auth = useAuth();
  const [doLogin] = useMutation(MUTATION_LOGIN);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const checkAuth = async () => {
      if (/access_token|id_token|error/.test(location.hash)) {
        await auth.handleAuthentication();
        await auth.fetchProfile();
      }

      if (auth.isAuthenticated()) {
        // Update state to set logged in
        doLogin({
          variables: {
            name: auth.getProfile().name,
          },
        });
        history.push(auth.redirectOnLogin() || '/');
      } else {
        history.push('/contribute');
      }
    };

    checkAuth();
  }, [auth, doLogin, history, location.hash]);

  return (
    <PageLayout>
      <p>Updating credentials</p>
    </PageLayout>
  );
};

export default Callback;

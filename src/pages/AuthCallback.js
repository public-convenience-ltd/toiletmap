import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../Auth';
import PageLayout from '../components/PageLayout';

const Callback = () => {
  const auth = useAuth();

  const { push } = useRouter();

  const hash = window?.location?.hash || '';

  useEffect(() => {
    const checkAuth = async () => {
      if (/access_token|id_token|error/.test(hash)) {
        await auth.handleAuthentication();
        await auth.fetchProfile();
      }

      if (auth.isAuthenticated()) {
        push(auth.redirectOnLogin() || '/');
      } else {
        push('/contribute');
      }
    };

    checkAuth();
  }, [auth, push, hash]);

  return (
    <PageLayout>
      <p>Updating credentials</p>
    </PageLayout>
  );
};

export default Callback;

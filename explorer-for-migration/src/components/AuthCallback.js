import React, { useEffect } from 'react';
import { useAuth } from '../../Auth';

const AuthCallback = ({ navigate, location }) => {
  const auth = useAuth();

  useEffect(() => {
    async function callback() {
      if (/access_token|id_token|error/.test(location.hash)) {
        await auth.handleAuthentication();
        await auth.fetchProfile();
      }

      if (auth.isAuthenticated()) {
        navigate('/explorer');
      } else {
        navigate('/explorer');
      }
    }

    callback();
  }, [auth, location, navigate]);

  return <h2>Updating credentials</h2>;
};

export default AuthCallback;

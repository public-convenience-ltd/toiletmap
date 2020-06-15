import React from 'react';
import auth0 from 'auth0-js';
import { setAuthHeader } from './graphql/fetcher';

const CLIENT_ID = 'sUts4RKy04JcyZ2IVFgMAC0rhPARCQYg';
const permissionsKey = 'https://toiletmap.org.uk/permissions';

export const AuthContext = React.createContext();
export const useAuth = () => React.useContext(AuthContext);

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check whether the current time is past the
  // Access Token's expiry time
  let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
  return new Date().getTime() < expiresAt;
};

export const getAccessToken = () => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No access token found');
  }
  return accessToken;
};

const getProfile = () => {
  return {
    name: localStorage.getItem('name'),
  };
};

const redirectOnNextLogin = (location) => {
  localStorage.setItem('redirectOnLogin', JSON.stringify(location));
};

const redirectOnLogin = () => {
  return JSON.parse(localStorage.getItem('redirectOnLogin'));
};

const logout = () => {
  // Clear Access Token and ID Token from local storage also the cached email
  localStorage.removeItem('name');
  localStorage.removeItem('nickname');
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('permissions');

  setAuthHeader(null);
};

const checkPermission = (perm) => {
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  return permissions.includes(perm);
};

const AuthProvider = ({ children }) => {
  const auth0Ref = React.useRef(
    new auth0.WebAuth({
      domain: 'gbptm.eu.auth0.com',
      responseType: 'token id_token',
      audience: 'https://www.toiletmap.org.uk/graphql',
      scope: 'openid profile report:loo',
      clientID: CLIENT_ID,
      redirectUri: `/callback`,
    })
  );

  const handleAuthentication = () =>
    new Promise((resolve, reject) => {
      auth0Ref.current.parseHash((err, authResult) => {
        if (err) {
          reject(err);
          return;
        }

        if (!authResult) {
          reject('No auth result');
          return;
        }

        // Set the time that the Access Token will expire at
        const expiresAt = JSON.stringify(
          authResult.expiresIn * 1000 + new Date().getTime()
        );

        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        localStorage.setItem('nickname', authResult.idTokenPayload.nickname);
        localStorage.setItem(
          'permissions',
          JSON.stringify(authResult.idTokenPayload[permissionsKey])
        );

        setAuthHeader(localStorage.getItem(authResult.accessToken));

        resolve();
      });
    });

  const fetchProfile = () =>
    new Promise((resolve, reject) => {
      const accessToken = getAccessToken();
      auth0Ref.current.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          localStorage.setItem('name', profile.name);
          resolve(profile);
        } else if (err) {
          reject(err);
        }
      });
    });

  const login = () => {
    auth0Ref.current.authorize();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        getAccessToken,
        redirectOnNextLogin,
        redirectOnLogin,
        login,
        logout,
        checkPermission,
        handleAuthentication,
        fetchProfile,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

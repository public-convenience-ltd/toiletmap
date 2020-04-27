import { createContext, useContext } from 'react';
import auth0 from 'auth0-js';
import history from './history';
import isFunction from 'lodash/isFunction';

const CLIENT_ID = 'sUts4RKy04JcyZ2IVFgMAC0rhPARCQYg';

const options = {
  domain: 'gbptm.eu.auth0.com',
  responseType: 'token id_token',
  audience: 'https://www.toiletmap.org.uk/graphql',
  scope: 'openid profile report:loo',
};

const makeAuth = () => {
  return new auth0.WebAuth({
    ...options,
    clientID: CLIENT_ID, // web client id from auth0
    redirectUri: `${window.location.origin}/callback`,
  });
};

class Auth {
  auth0 = makeAuth();

  handleAuthentication = () =>
    new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          reject(err);
          return;
        }

        this.setSession(authResult);
        resolve();
      });
    });

  setSession = (authResult) => {
    if (!authResult) {
      return;
    }
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  };

  getAccessToken = () => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found');
    }
    return accessToken;
  };

  fetchProfile = () =>
    new Promise((resolve, reject) => {
      const accessToken = this.getAccessToken();
      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          localStorage.setItem('name', profile.name);
          resolve(profile);
        } else if (err) {
          reject(err);
        }
      });
    });

  getProfile = () => {
    return {
      name: localStorage.getItem('name'),
    };
  };

  redirectOnNextLogin = (location) => {
    localStorage.setItem('redirectOnLogin', JSON.stringify(location));
  };

  redirectOnLogin = () => {
    return JSON.parse(localStorage.getItem('redirectOnLogin'));
  };

  login = () => {
    this.auth0.authorize();
  };

  logout = () => {
    // Clear Access Token and ID Token from local storage also the cached email
    localStorage.removeItem('name');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');

    // navigate to the home route
    history.replace('/');
  };

  isAuthenticated = () => {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  };

  reactContextLogin = () => {
    this.login();
    return;
  };

  reactContextLogout = (logoutMutation, history) => {
    this.logout();
    logoutMutation();
    history.push('/');
  };
}

export const AuthContext = createContext(new Auth());

const AuthProvider = ({ children }) => {
  const auth = useContext(AuthContext);

  return isFunction(children) ? children(auth) : children;
};

export const useAuth = () => {
  const auth = useContext(AuthContext);

  return auth;
};

export default AuthProvider;

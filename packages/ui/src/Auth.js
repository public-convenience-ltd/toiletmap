import auth0 from 'auth0-js';
import history from './history';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: 'gbptm.eu.auth0.com',
    clientID: 'sUts4RKy04JcyZ2IVFgMAC0rhPARCQYg',
    redirectUri: `${window.location.origin}/callback`,
    responseType: 'token id_token',
    audience: 'https://www.toiletmap.org.uk/api',
    scope: 'openid profile report:loo',
  });

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.fetchProfile = this.fetchProfile.bind(this);
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          resolve();
        } else if (err) {
          reject(err);
        }
      });
    });
  }

  setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  getAccessToken() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      throw new Error('No access token found');
    }
    return accessToken;
  }

  fetchProfile() {
    return new Promise((resolve, reject) => {
      let accessToken = this.getAccessToken();
      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          localStorage.setItem('name', profile.name);
          resolve(profile);
        } else if (err) {
          reject(err);
        }
      });
    });
  }

  getProfile() {
    return {
      name: localStorage.getItem('name'),
    };
  }

  redirectOnNextLogin(location) {
    localStorage.setItem('redirectOnLogin', JSON.stringify(location));
  }

  redirectOnLogin() {
    return JSON.parse(localStorage.getItem('redirectOnLogin'));
  }

  login() {
    this.auth0.authorize();
  }

  logout() {
    // Clear Access Token and ID Token from local storage also the cached email
    localStorage.removeItem('name');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    history.replace('/');
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  reactContextLogout(logoutMutation, history) {
    this.logout();
    logoutMutation();
    history.push('/');
  }
}

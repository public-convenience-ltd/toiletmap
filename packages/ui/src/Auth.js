import auth0 from 'auth0-js';
import history from './history';
import config from './config';

const { SafariViewController } = window;
const SHORT_PACKAGE_ID = 'toiletmap';
const NATIVE_CLIENT_ID = '84wrZFZ9q8fOK6N9gqUU2DXl5du9y4ht';
const WEB_CLIENT_ID = 'sUts4RKy04JcyZ2IVFgMAC0rhPARCQYg';

const options = {
  domain: 'gbptm.eu.auth0.com',
  responseType: 'token id_token',
  audience: 'https://www.toiletmap.org.uk/graphql',
  scope: 'openid profile report:loo',
};

const makeAuthWeb = () => {
  return new auth0.WebAuth({
    ...options,
    clientID: WEB_CLIENT_ID, // web client id from auth0
    redirectUri: `${window.location.origin}/callback`,
  });
};
const makeAuthNative = () => {
  return new auth0.Authentication({
    ...options,
    clientID: NATIVE_CLIENT_ID, // native client id from auth0
  });
};
const nativeAuthorize = (client, opts) =>
  new Promise((resolve, reject) => {
    client.authorize(opts, (err, authResult) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      resolve(authResult);
    });
  });
const loginNative = async () => {
  const { default: Auth0Cordova } = await import('@auth0/cordova');

  const client = new Auth0Cordova({
    ...options,
    // LOWERCASE d, different from other auth0 client calls - on purpose.
    clientId: NATIVE_CLIENT_ID, // copied from above
    packageIdentifier: SHORT_PACKAGE_ID,
  });

  const authOpts = {
    scope: options.scope,
    audience: options.audience,
  };

  return await nativeAuthorize(client, authOpts);
};

function getRedirectUrl() {
  const returnTo = `${SHORT_PACKAGE_ID}://gbptm.eu.auth0.com/cordova/${SHORT_PACKAGE_ID}/callback`;
  const url = `https://gbptm.eu.auth0.com/v2/logout?client_id=${NATIVE_CLIENT_ID}&returnTo=${returnTo}`;

  return url;
}

function openUrl(url) {
  if (!SafariViewController) {
    return;
  }

  SafariViewController.isAvailable(function(available) {
    if (available) {
      SafariViewController.show(
        {
          url: url,
        },
        function(result) {
          if (result.event === 'opened') {
            console.log('opened');
          } else if (result.event === 'loaded') {
            console.log('loaded');
          } else if (result.event === 'closed') {
            console.log('closed');
          }
        },
        function(msg) {
          console.log('KO: ' + JSON.stringify(msg));
        }
      );
    } else {
      window.open(url, '_system');
    }
  });
}

export default class Auth {
  auth0 = config.isNativeApp() ? makeAuthNative() : makeAuthWeb();

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

  setSession = authResult => {
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

  redirectOnNextLogin = location => {
    localStorage.setItem('redirectOnLogin', JSON.stringify(location));
  };

  redirectOnLogin = () => {
    return JSON.parse(localStorage.getItem('redirectOnLogin'));
  };

  webLogin = () => {
    this.auth0.authorize();
  };

  nativeLogin = async () => {
    // we need to do the same flow web, without the auth callback URL
    // instead we launch a sub-browser window which the user logs in with
    let authResult;
    try {
      authResult = await loginNative();
    } catch (err) {
      // No neat way to check the type.
      if (err.message.indexOf('canceled') === -1) {
        throw err;
      }

      return;
    }

    // the callback is of the form toiletmap://gbptm.eu.auth0.com/cordova/toiletmap/callback
    // we've been called back - the callback launches the app with args and we have the auth result
    if (authResult && authResult.accessToken && authResult.idToken) {
      this.setSession(authResult);

      await this.getProfile();
    }
  };

  logout = () => {
    // Clear Access Token and ID Token from local storage also the cached email
    localStorage.removeItem('name');
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    if (SafariViewController) {
      openUrl(getRedirectUrl());
      return;
    }

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
    if (!config.isNativeApp()) {
      // TODO move to new login place
      this.webLogin();
      return;
    }
    this.nativeLogin();
  };

  reactContextLogout = (logoutMutation, history) => {
    this.logout();
    logoutMutation();
    history.push('/');
  };
}

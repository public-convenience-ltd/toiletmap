import { defineConfig } from 'cypress';
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions';
import encrypt from 'cypress-nextjs-auth0/encrypt';

export default defineConfig({
  port: 3001,
  chromeWebSecurity: false,
  video: false,
  defaultCommandTimeout: 15000,
  responseTimeout: 15000,
  requestTimeout: 15000,
  env: {
    browserPermissions: {
      geolocation: 'allow',
    },
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
      on('task', {
        log(message) {
          console.log(message);

          return null;
        },
        table(message) {
          console.table(message);

          return null;
        },
        encrypt,
      });

      // eslint-disable-next-line no-param-reassign
      config = cypressBrowserPermissionsPlugin(on, config);

      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          // launchOptions.preferences is a map of preference names to values
          // eslint-disable-next-line functional/immutable-data
          launchOptions.preferences[
            'network.proxy.testing_localhost_is_secure_when_hijacked'
          ] = true;

          return launchOptions;
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });

      return config;
    },
    baseUrl: 'http://localhost:3000',
  },
});

import { defineConfig } from 'cypress';
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions';
import encrypt from 'cypress-nextjs-auth0/encrypt';

export default defineConfig({
  port: 3001,
  projectId: '2pry2v',
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
        if (browser.name === 'chrome' && browser.isHeadless) {
          const headlessIndex = launchOptions.args.indexOf('--headless');
          if (headlessIndex > -1) {
            launchOptions.args[headlessIndex] = '--headless=new';
          }
        }

        // whatever you return here becomes the launchOptions
        return launchOptions;
      });

      return config;
    },
    baseUrl: 'http://localhost:3000',
  },
});

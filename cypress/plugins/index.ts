// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions';
import encrypt from 'cypress-nextjs-auth0/encrypt';

const pluginConfig: Cypress.PluginConfig = (on, config) => {
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
  return config;
};

export default pluginConfig;

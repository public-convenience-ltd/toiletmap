// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import 'cypress-nextjs-auth0';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in a user with the given credentials (via Cypress.env)
       * or overwrite the credentials with new credentials.
       */
      login(options?: {
        username?: string;
        password?: string;
      }): Chainable<Element>;

      /**
       * Logs the logged in user out. One can add a custom returnTo URL.
       */
      logout(returnTo?: string): Chainable<Element>;

      /**
       * Clears all existing (splitted or not) Auth0 cookies
       *
       * ## Docs
       * @see https://docs.cypress.io/api/commands/clearcookie
       * @see https://docs.cypress.io/api/commands/clearcookies
       */
      clearAuth0Cookies(): Chainable<Element>;

      /**
       * Preserves cookies through multiple tests. It's best used in the
       * `beforeEach` hook.
       *
       * ## Docs
       * @see https://docs.cypress.io/api/cypress-api/cookies#Preserve-Once
       */
      preserveAuth0CookiesOnce(): Chainable<Element>;
    }
  }
}

describe('Adding new toilets to the platform', () => {
  context('Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-8');
    });

    it.only('should load the add toilet page successfully for authenticated users', () => {
      cy.visit('/');
      cy.login().then(() => {
        // Now run your test...
        cy.request('/api/auth/me').then(({ body: user }) => {
          cy.visit('/loos/add');
          expect(user.email).to.equal(Cypress.env('auth0Username'));
        });
      });
    });
  });
});

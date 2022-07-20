describe('Remove page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    before(() => {
      cy.login();
    });

    after(() => {
      cy.clearAuth0Cookies();
    });

    afterEach(() => {
      cy.preserveAuth0CookiesOnce();
    });

    it('should remove a toilet successfully when going through the removal flow', () => {
      cy.visit('/loos/1dd2dd8c7cb5c3fd8e956fce/remove');
      cy.contains('Toilet Remover');
      cy.contains(
        "Please let us know why you're removing this toilet from the map using the form below."
      );
      cy.contains('Reason for removal')
        .click()
        .type(
          'I am removing this toilet because it has been closed for a looooooooong time'
        );
      cy.findByText('Remove').click();

      cy.get('[data-toiletid="1dd2dd8c7cb5c3fd8e956fce"]').should('exist');

      cy.contains('Thank you, toilet removed!');
      cy.contains('Removed');

      cy.get('body').trigger('keydown', { key: 'Escape' });

      cy.contains('Removed');

      cy.get('body').trigger('keydown', { key: 'Escape' });
      cy.get('[data-toiletid="1dd2dd8c7cb5c3fd8e956fce"]').should('not.exist');
    });
  });
});

describe('Remove page tests', () => {
  context('Mobile', () => {
    beforeEach(() => {
      cy.viewport('iphone-8');
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
      cy.visit('/loos/ea0abca4b3f96bbea983f2ab/remove');

      // Check the page content.
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

      cy.get('[data-toiletid="ea0abca4b3f96bbea983f2ab"]').should('exist');

      // Ensure the successful removal toast is displayed.
      cy.contains('Thank you, toilet removed!');

      // Check that the removed chip is displayed along with the associated tooltip.
      cy.contains('Removed').invoke('show').click({ force: true });
      cy.contains(
        'I am removing this toilet because it has been closed for a looooooooong time'
      );

      cy.get('body').trigger('keydown', { key: 'Escape' });

      // Check that the removed chip is displayed along with the associated tooltip.
      cy.contains('Removed').invoke('show').click({ force: true });
      cy.contains(
        'I am removing this toilet because it has been closed for a looooooooong time'
      );

      cy.get('body').trigger('keydown', { key: 'Escape' });

      // Ensure that the toilet is removed from the geohash tile cache
      cy.get('[data-toiletid="ea0abca4b3f96bbea983f2ab"]').should('not.exist');
    });
  });
});

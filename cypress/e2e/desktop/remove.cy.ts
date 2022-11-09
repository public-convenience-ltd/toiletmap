describe.skip('Remove page tests', () => {
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
      cy.visit('/loos/3161/remove');

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

      cy.get('[data-toiletid="3161"]').should('exist');

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
      cy.get('[data-toiletid="3161"]').should('not.exist');
    });
  });
});

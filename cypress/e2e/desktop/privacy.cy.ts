describe('Privacy page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    it('is correctly titled', () => {
      cy.visit('/privacy');
      cy.title().should('equal', 'Toilet Map: Privacy Policy');
    });

    it('renders as expected', () => {
      cy.visit('/privacy');
      cy.contains('Privacy Policy');
      cy.contains('Visitors to the site');
      cy.contains('Contributors to the site');
      cy.contains('gbtoiletmap@gmail.com');
    });
  });
});

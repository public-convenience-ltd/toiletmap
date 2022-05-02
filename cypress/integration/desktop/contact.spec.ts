describe('Contact page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    it('is correctly titled', () => {
      cy.visit('/contact');
      cy.title().should('equal', 'Toilet Map: Contact Us');
    });

    it('renders as expected', () => {
      cy.visit('/contact');
      cy.contains('Contact Us');
      cy.contains(
        'If you have any problems updating the toilets, or wish to send us toilet details or comments, please contact gbtoiletmap@gmail.com.'
      );
    });
  });
});

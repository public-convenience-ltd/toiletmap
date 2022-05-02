describe('About page tests', () => {
  context('Desktop', () => {
    beforeEach(() => {
      cy.viewport('macbook-16');
    });
    it('is correctly titled', () => {
      cy.visit('/about');
      cy.title().should('equal', 'Toilet Map: About');
    });

    it('renders as expected', () => {
      cy.visit('/about');
      cy.contains('About the Toilet Map');
    });

    it('has a download for the volunteer help guide', () => {
      cy.visit('/about');

      cy.findByText('Download volunteer help guide')
        .scrollIntoView()
        .invoke('attr', 'href')
        .should('contain', 'Toilet.Map.Volunteer.Help.Guide.pdf');
    });

    it('has a download for the toilet checklist', () => {
      cy.visit('/about');

      cy.findByText('Download toilet checklist')
        .scrollIntoView()
        .invoke('attr', 'href')
        .should('contain', '/GBPTM.Toilet.Checklist.pdf');
    });
  });
});

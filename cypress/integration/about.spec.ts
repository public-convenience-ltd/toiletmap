describe('About page tests', () => {
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
      .should('eq', 'Toilet.Map.Volunteer.Help.Guide.pdf');
  });

  it('has a download for the toilet checklist', () => {
    cy.visit('/about');

    cy.findByText('Download toilet checklist')
      .scrollIntoView()
      .invoke('attr', 'href')
      .should('eq', '/GBPTM.Toilet.Checklist.pdf');
  });
});

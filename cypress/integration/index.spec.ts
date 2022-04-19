describe('Home page tests', () => {
  const baseUrl = 'http://localhost:4444';

  it('is correctly titled', () => {
    cy.visit(baseUrl);
    cy.title().should('equal', 'The Great British Toilet Map: Find Toilet');
  });
});
